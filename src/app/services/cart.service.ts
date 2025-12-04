import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
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

  getCartChanges(): Observable<void> {
    return this.cartChanged.asObservable();
  }

  getCartItems(): Observable<CartItem[]> {
    const user = this.authService.getCurrentUser();
    
    return new Observable(observer => {
      if (user?.id) {
        // Utilisateur connecté
        this.http.get<{status: string, message: string, data: any[]}>(`${this.apiUrl}/user/${user.id}`).subscribe({
          next: (response) => {
            const items = response.data.map(item => ({
              id: item.id,
              userId: user.id,
              game: item.game,
              quantity: item.quantity,
              subtotal: item.subtotal,
              createdAt: item.createdAt
            }));
            observer.next(items);
            observer.complete();
          },
          error: (error) => {
            observer.error(error);
          }
        });
      } else {
        // Invité
        this.http.get<{status: string, message: string, data: any[]}>(`${this.apiUrl}/session/${this.guestSessionId}`).subscribe({
          next: (response) => {
            const items = response.data.map(item => ({
              id: item.id,
              sessionId: this.guestSessionId,
              game: item.game,
              quantity: item.quantity,
              subtotal: item.subtotal,
              createdAt: item.createdAt
            }));
            observer.next(items);
            observer.complete();
          },
          error: (error) => {
            observer.error(error);
          }
        });
      }
    });
  }

  addToCart(game: Game, quantity: number = 1): Observable<CartItem> {
    return new Observable(observer => {
      const user = this.authService.getCurrentUser();
      
      // D'abord, récupérer le panier actuel pour vérifier si l'article existe déjà
      this.getCartItems().subscribe({
        next: (items) => {
          const existingItem = items.find(item => item.game.id === game.id);
          
          if (existingItem) {
            // Mettre à jour la quantité
            const updatedQuantity = existingItem.quantity + quantity;
            this.updateQuantity(existingItem.id, updatedQuantity).subscribe({
              next: (result) => {
                observer.next(result);
                observer.complete();
              },
              error: (error) => observer.error(error)
            });
          } else {
            // Créer un nouvel élément de panier
            const newItem = {
              game: game,
              quantity: quantity,
              subtotal: game.price * quantity,
              createdAt: new Date().toISOString()
            };

            this.http.post<{status: string, message: string, data: any}>(this.apiUrl, newItem).subscribe({
              next: (response) => {
                const result = {
                  id: response.data.id,
                  userId: user?.id || 0,
                  sessionId: user ? undefined : this.guestSessionId,
                  game: response.data.game,
                  quantity: response.data.quantity,
                  subtotal: response.data.subtotal,
                  createdAt: response.data.createdAt
                };
                this.cartChanged.next();
                observer.next(result);
                observer.complete();
              },
              error: (error) => {
                observer.error(error);
              }
            });
          }
        },
        error: (error) => observer.error(error)
      });
    });
  }

  updateQuantity(itemId: number, quantity: number): Observable<CartItem> {
    return new Observable(observer => {
      // D'abord, récupérer l'élément actuel
      this.http.get<{status: string, message: string, data: any}>(`${this.apiUrl}/${itemId}`).subscribe({
        next: (response) => {
          const currentItem = response.data;
          const updatedItem = {
            id: currentItem.id,
            game: currentItem.game,
            quantity: quantity,
            subtotal: currentItem.game.price * quantity,
            createdAt: currentItem.createdAt
          };

          // Mettre à jour l'élément
          this.http.put<{status: string, message: string, data: any}>(`${this.apiUrl}/${itemId}`, updatedItem).subscribe({
            next: (response) => {
              const result = {
                id: response.data.id,
                userId: currentItem.userId || 0,
                sessionId: currentItem.sessionId || this.guestSessionId,
                game: response.data.game,
                quantity: response.data.quantity,
                subtotal: response.data.subtotal,
                createdAt: response.data.createdAt
              };
              this.cartChanged.next();
              observer.next(result);
              observer.complete();
            },
            error: (error) => observer.error(error)
          });
        },
        error: (error) => observer.error(error)
      });
    });
  }

  removeFromCart(itemId: number): Observable<void> {
    return new Observable(observer => {
      this.http.delete<{status: string, message: string, data: null}>(`${this.apiUrl}/${itemId}`).subscribe({
        next: () => {
          this.cartChanged.next();
          observer.next();
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  clearCart(): Observable<void> {
    return new Observable(observer => {
      const user = this.authService.getCurrentUser();
      
      if (user?.id) {
        // Utilisateur connecté
        this.http.delete<{status: string, message: string, data: null}>(`${this.apiUrl}/user/${user.id}`).subscribe({
          next: () => {
            this.cartChanged.next();
            observer.next();
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
      } else {
        // Invité
        this.http.delete<{status: string, message: string, data: null}>(`${this.apiUrl}/session/${this.guestSessionId}`).subscribe({
          next: () => {
            this.cartChanged.next();
            observer.next();
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
      }
    });
  }

  getCartSummary(): Observable<CartSummary> {
    return new Observable(observer => {
      this.getCartItems().subscribe({
        next: (items) => {
          const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
          const shippingFee = subtotal > 100 ? 15 : 0;
          const total = subtotal + shippingFee;
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

          observer.next({
            subtotal,
            shippingFee,
            total,
            itemCount
          });
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  getTotalItems(): Observable<number> {
    return new Observable(observer => {
      this.getCartItems().subscribe({
        next: (items) => {
          const total = items.reduce((sum, item) => sum + item.quantity, 0);
          observer.next(total);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  clearGuestSession(): void {
    this.guestSessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guestSessionId', this.guestSessionId);
  }
}