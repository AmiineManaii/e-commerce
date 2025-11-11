import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, map, tap } from 'rxjs';
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
    if (user?.id) {
      return `${this.apiUrl}?userId=${user.id}`;
    } else {
      return `${this.apiUrl}?sessionId=${this.guestSessionId}`;
    }
  }

  private getCartItemUrl(itemId: number): string {
    return `${this.apiUrl}/${itemId}`;
  }

  

  getCartChanges(): Observable<void> {
    return this.cartChanged.asObservable();
  }

  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.getCurrentUserCartUrl()).pipe(
      map(items => items || [])
    );
  }

  addToCart(game: Game, quantity: number = 1): Observable<CartItem> {
    return new Observable(subscriber => {
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

      this.getCartItems().subscribe({
        next: (items) => {
          const existingItem = items.find(item => 
            item.game.id === game.id && 
            ((user && item.userId === user.id) || (!user && item.sessionId === this.guestSessionId))
          );
          
          if (existingItem) {
            newItem.id = existingItem.id;
            newItem.quantity += existingItem.quantity;
            newItem.subtotal = game.price * newItem.quantity;
            
            this.http.put<CartItem>(this.getCartItemUrl(existingItem.id), newItem).subscribe({
              next: (result) => {
                this.cartChanged.next();
                subscriber.next(result);
                subscriber.complete();
              },
              error: (error) => subscriber.error(error)
            });
          } else {
            this.http.post<CartItem>(this.apiUrl, newItem).subscribe({
              next: (result) => {
                this.cartChanged.next();
                subscriber.next(result);
                subscriber.complete();
              },
              error: (error) => subscriber.error(error)
            });
          }
        },
        error: (error) => subscriber.error(error)
      });
    });
  }

  updateQuantity(itemId: number, quantity: number): Observable<CartItem> {
    return new Observable(subscriber => {
      const user = this.authService.getCurrentUser();
      
      this.http.get<CartItem>(this.getCartItemUrl(itemId)).subscribe({
        next: (currentItem) => {
          const isOwner = (user && currentItem.userId === user.id) || 
                         (!user && currentItem.sessionId === this.guestSessionId);
          
          if (!isOwner) {
            subscriber.error(new Error('Non autorisé à modifier ce panier'));
            return;
          }

          const updatedItem: CartItem = {
            ...currentItem,
            quantity: quantity,
            subtotal: currentItem.game.price * quantity
          };

          this.http.patch<CartItem>(this.getCartItemUrl(itemId), updatedItem).subscribe({
            next: (result) => {
              this.cartChanged.next();
              subscriber.next(result);
              subscriber.complete();
            },
            error: (error) => subscriber.error(error)
          });
        },
        error: (error) => subscriber.error(error)
      });
    });
  }

  removeFromCart(itemId: number): Observable<CartItem> {
    return new Observable(subscriber => {
      const user = this.authService.getCurrentUser();
      
      this.http.get<CartItem>(this.getCartItemUrl(itemId)).subscribe({
        next: (item) => {
          const isOwner = (user && item.userId === user.id) || 
                         (!user && item.sessionId === this.guestSessionId);
          
          if (!isOwner) {
            subscriber.error(new Error('Non autorisé à supprimer ce panier'));
            return;
          }
          
          this.http.delete<CartItem>(this.getCartItemUrl(itemId)).subscribe({
            next: (result) => {
              this.cartChanged.next();
              subscriber.next(result);
              subscriber.complete();
            },
            error: (error) => subscriber.error(error)
          });
        },
        error: (error) => subscriber.error(error)
      });
    });
  }

  clearCart(): Observable<void> {
    return new Observable(subscriber => {
      this.getCartItems().subscribe({
        next: (items) => {
          if (items.length === 0) {
            subscriber.next();
            subscriber.complete();
            return;
          }

          const deleteObservables = items.map(item => 
            this.http.delete(this.getCartItemUrl(item.id))
          );

          let completedCount = 0;
          deleteObservables.forEach(observable => {
            observable.subscribe({
              next: () => {
                completedCount++;
                if (completedCount === deleteObservables.length) {
                  this.cartChanged.next();
                  subscriber.next();
                  subscriber.complete();
                }
              },
              error: (error) => subscriber.error(error)
            });
          });
        },
        error: (error) => subscriber.error(error)
      });
    });
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