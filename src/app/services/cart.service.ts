import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap, switchMap, map, forkJoin, of } from 'rxjs';
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

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getCurrentUserCartUrl(): string {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      throw new Error('Utilisateur non connecté');
    }
    return `${this.apiUrl}?userId=${user.id}`;
  }

  private getCartItemUrl(itemId: number): string {
    return `${this.apiUrl}/${itemId}`;
  }

  getCartChanges(): Observable<void> {
    return this.cartChanged.asObservable();
  }

  getCartItems(): Observable<CartItem[]> {
    try {
      return this.http.get<CartItem[]>(this.getCurrentUserCartUrl());
    } catch (error) {
      return of([]); // Retourner un tableau vide si utilisateur non connecté
    }
  }

  addToCart(game: Game, quantity: number = 1): Observable<CartItem> {
    const user = this.authService.getCurrentUser();
    if (!user || !user.id) {
      throw new Error('Utilisateur doit être connecté pour ajouter au panier');
    }

    const newItem: CartItem = {
      id: Date.now(),
      userId: user.id,
      game: game,
      quantity: quantity,
      subtotal: game.price * quantity,
      createdAt: new Date().toISOString()
    };

    return this.getCartItems().pipe(
      switchMap(items => {
        const existingItem = items.find(item => 
          item.game.id === game.id && item.userId === user.id
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
    if (!user || !user.id) {
      throw new Error('Utilisateur non connecté');
    }

    return this.http.get<CartItem>(this.getCartItemUrl(itemId)).pipe(
      switchMap(currentItem => {
        if (currentItem.userId !== user.id) {
          throw new Error('Non autorisé à modifier ce panier');
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
    if (!user || !user.id) {
      throw new Error('Utilisateur non connecté');
    }

    return this.http.get<CartItem>(this.getCartItemUrl(itemId)).pipe(
      switchMap(item => {
        if (item.userId !== user.id) {
          throw new Error('Non autorisé à supprimer ce panier');
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
}