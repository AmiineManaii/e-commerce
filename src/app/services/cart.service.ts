import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap, switchMap, map, forkJoin, of, throwError } from 'rxjs';
import { CartItem, CartSummary } from '../Models/cart-item.model';
import { Game } from '../Models/game.model';
import { API_BASE_URL } from '../app.config';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = API_BASE_URL + '/cart';
  private cartChanged = new Subject<void>();
  private guestSessionId: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.guestSessionId = this.getOrCreateGuestSessionId();
  }

  // Générer un ID de session pour les utilisateurs non connectés
  private getOrCreateGuestSessionId(): string {
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guestSessionId', sessionId);
    }
    return sessionId;
  }

  private getCurrentUserCartUrl(): string {
    const user = this.authService.getCurrentUser();
    if (user && user.id) {
      // Utilisateur connecté : filtrer par userId
      return `${this.apiUrl}?userId=${user.id}`;
    } else {
      // Utilisateur non connecté : filtrer par sessionId
      return `${this.apiUrl}?sessionId=${this.guestSessionId}`;
    }
  }

  private getCartItemUrl(itemId: number): string {
    return `${this.apiUrl}/${itemId}`;
  }

  // Migrer le panier guest vers l'utilisateur après connexion
  migrateGuestCartToUser(userId: number): Observable<any> {
    const guestCartUrl = `${this.apiUrl}?sessionId=${this.guestSessionId}`;
    
    return this.http.get<CartItem[]>(guestCartUrl).pipe(
      switchMap(guestItems => {
        if (guestItems.length === 0) {
          return of(null);
        }

        // Mettre à jour tous les items du panier guest avec le nouveau userId
        const updateRequests = guestItems.map(item => 
          this.http.patch<CartItem>(`${this.apiUrl}/${item.id}`, { 
            userId: userId,
            sessionId: null 
          })
        );

        return forkJoin(updateRequests).pipe(
          tap(() => {
            // Créer une nouvelle session guest après migration
            this.guestSessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('guestSessionId', this.guestSessionId);
            this.cartChanged.next();
          })
        );
      })
    );
  }

  getCartChanges(): Observable<void> {
    return this.cartChanged.asObservable();
  }

  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.getCurrentUserCartUrl()).pipe(
      map(items => items || []),
     
      switchMap(items => of(items)),
     
      switchMap(items => of(items))
    );
  }

  addToCart(game: Game, quantity: number = 1): Observable<CartItem> {
    const user = this.authService.getCurrentUser();
    
    const newItem: CartItem = {
      id: Date.now(),
      userId: user?.id || 0,
      sessionId: user ? undefined : this.guestSessionId, 
      game: game,
      quantity: quantity,
      subtotal: game.price * quantity,
      createdAt: new Date().toISOString()
    };

    return this.getCartItems().pipe(
      switchMap(items => {
        const existingItem = items.find(item => 
          item.game.id === game.id && 
          ((user && item.userId === user.id) || (!user && item.sessionId === this.guestSessionId))
        );
        
        if (existingItem) {
          newItem.id = existingItem.id;
          newItem.quantity += existingItem.quantity;
          newItem.subtotal = game.price * newItem.quantity;
          
          return this.http.put<CartItem>(
            this.getCartItemUrl(existingItem.id), 
            newItem
          ).pipe(
            tap(() => this.cartChanged.next())
          );
        } else {
          return this.http.post<CartItem>(this.apiUrl, newItem).pipe(
            tap(() => this.cartChanged.next())
          );
        }
      })
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<CartItem> {
    const user = this.authService.getCurrentUser();
    
    return this.http.get<CartItem>(this.getCartItemUrl(itemId)).pipe(
      switchMap(currentItem => {
        const isOwner = (user && currentItem.userId === user.id) || 
                       (!user && currentItem.sessionId === this.guestSessionId);
        
        if (!isOwner) {
          return throwError(() => new Error('Non autorisé à modifier ce panier'));
        }

        const updatedItem: CartItem = {
          ...currentItem,
          quantity: quantity,
          subtotal: currentItem.game.price * quantity
        };

        return this.http.patch<CartItem>(
          this.getCartItemUrl(itemId), 
          updatedItem
        ).pipe(
          tap(() => this.cartChanged.next())
        );
      })
    );
  }

  removeFromCart(itemId: number): Observable<CartItem> {
    const user = this.authService.getCurrentUser();
    
    return this.http.get<CartItem>(this.getCartItemUrl(itemId)).pipe(
      switchMap(item => {

        const isOwner = (user && item.userId === user.id) || 
                       (!user && item.sessionId === this.guestSessionId);
        
        if (!isOwner) {
          return throwError(() => new Error('Non autorisé à supprimer ce panier'));
        }
        
        return this.http.delete<CartItem>(this.getCartItemUrl(itemId)).pipe(
          tap(() => this.cartChanged.next())
        );
      })
    );
  }

  clearCart(): Observable<void> {
    return this.getCartItems().pipe(
      switchMap(items => {
        if (items.length === 0) {
          return of(undefined);
        }

        const deleteRequests = items.map(item => 
          this.http.delete(this.getCartItemUrl(item.id))
        );
        
        return forkJoin(deleteRequests).pipe(
          tap(() => this.cartChanged.next()),
          map(() => {})
        );
      })
    );
  }

  getCartSummary(): Observable<CartSummary> {
    return this.getCartItems().pipe(
      map(items => {
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const shippingFee = subtotal > 100 ? 15 : 0;
        const total = subtotal + shippingFee;
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return {
          subtotal,
          shippingFee,
          total,
          itemCount
        };
      })
    );
  }

  getTotalItems(): Observable<number> {
    return this.getCartItems().pipe(
      map(items => items.reduce((sum, item) => sum + item.quantity, 0))
    );
  }


  clearGuestSession(): void {
    this.guestSessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guestSessionId', this.guestSessionId);
  }
}