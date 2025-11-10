import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { CartItem, CartSummary } from '../Models/cart-item.model';
import { Game } from '../Models/game.model';
import { API_BASE_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = API_BASE_URL + '/cart';
  private cartChanged = new Subject<void>()

  constructor(private http: HttpClient) { }


 ;

getCartChanges(): Observable<void> {
  return this.cartChanged.asObservable();
}

  getCartItems(): Observable<CartItem[]> {
    return new Observable(observer => {
      this.http.get<CartItem[]>(this.apiUrl).subscribe({
        next: (items) => {
          observer.next(items);
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  

  addToCart(game: Game, quantity: number = 1): Observable<CartItem> {
    
    const newItem: CartItem = {
      id: Date.now(),
      game: game,
      quantity: quantity,
      subtotal: game.price * quantity,
      createdAt: new Date().toISOString()
    };

    return this.http.post<CartItem>(this.apiUrl, newItem).pipe(
    tap(() => this.cartChanged.next())
  );
  }


  updateQuantity(itemId: number, quantity: number): Observable<CartItem> {
    
    return new Observable(observer => {
      this.http.get<CartItem>(`${this.apiUrl}/${itemId}`).subscribe({
        next: (currentItem) => {
          const updatedItem: CartItem = {
            ...currentItem,
            quantity: quantity,
            subtotal: currentItem.game.price * quantity
          };

          this.http.patch<CartItem>(`${this.apiUrl}/${itemId}`, updatedItem).subscribe({
            next: (savedItem) => {
              observer.next(savedItem);
              observer.complete();
            },
            error: (error) => {
              observer.error(error);
            }
          });
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }


  removeFromCart(itemId: number): Observable<CartItem> {
    //console.log(itemId);
    return this.http.delete<CartItem>(`${this.apiUrl}/${itemId}`).pipe(
    tap(() => this.cartChanged.next())
  );
  }

 
  clearCart(): Observable<void> {
    return new Observable(observer => {
      this.getCartItems().subscribe({
        next: (items) => {
          
          const deleteRequests = items.map(item => 
            this.removeFromCart(item.id).subscribe()
          );
          
          
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
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

          const summary: CartSummary = {
            subtotal,
            shippingFee,
            total,
            itemCount
          };

          observer.next(summary);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
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
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
}