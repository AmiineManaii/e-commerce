import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { CartItem, CartSummary } from '../Models/cart-item.model';
import { Game } from '../Models/game.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCartFromServer();
  }


  loadCartFromServer(): void {
    this.http.get<CartItem[]>(this.apiUrl).subscribe({

      next: (items) => {
        this.cartItemsSubject.next(items || []);
      
      },

      error: (error) => {
        console.error('Error loading cart:', error);
        this.cartItemsSubject.next([]);
      
      }
    });
  }

 
  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  

  addToCart(game: Game, quantity: number = 1): Observable<CartItem> {

    const existingItem = this.findCartItemByGameId(game.id);
    
    if (existingItem) {


      return this.updateQuantity(existingItem.id, existingItem.quantity + quantity);
    }

    const newItem: CartItem = {
      id: Date.now(), 
      game: game,
      quantity: quantity,
      subtotal: game.price * quantity,
      createdAt: new Date().toISOString()
    };


    return this.http.post<CartItem>(this.apiUrl, newItem).pipe(
      
      tap((item) => {
        const currentItems = this.cartItemsSubject.value;
        this.cartItemsSubject.next([...currentItems, item]);
      }),

      catchError((error) => {
        console.error('Error adding to cart:', error);
        alert(error.message);
        return throwError(() => error);
      })
    );
  }


  updateQuantity(itemId: number, quantity: number): Observable<CartItem> {
    if (quantity <= 0) {
      this.removeFromCart(itemId).subscribe();

      return of({
        id: itemId,
        game: {} as Game,
        quantity: 0,
        subtotal: 0,
        createdAt: new Date().toISOString()
      });
    }

    const currentItems = this.cartItemsSubject.value;
    const item = currentItems.find(i => i.id === itemId);
    
    if (!item) {
      throw new Error('Item not found in cart');
    }

    const updatedItem: CartItem = {
      ...item,
      quantity: quantity,
      subtotal: item.game.price * quantity
    };


    return this.http.patch<CartItem>(`${this.apiUrl}/${itemId}`, updatedItem).pipe(
      tap((updated) => {
        const items = currentItems.map(i => i.id === itemId ? updated : i);
        this.cartItemsSubject.next(items);
      }),
      catchError((error) => {
        console.error('Error updating quantity:', error);
        const items = currentItems.map(i => i.id === itemId ? updatedItem : i);
        this.cartItemsSubject.next(items);
        return of(updatedItem);
      })
    );
  }

  removeFromCart(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${itemId}`).pipe(
      tap(() => {
        const currentItems = this.cartItemsSubject.value;
        const items = currentItems.filter(i => i.id !== itemId);
        this.cartItemsSubject.next(items);
      }),
      catchError((error) => {
        console.error('Error removing from cart:', error);
        alert(error.message);
        return throwError(() => error);

      })
    );
  }



  clearCart(): Observable<void> {

  return this.http.get<CartItem[]>(this.apiUrl).pipe(
    tap((items) => {
      items.forEach((item) => {
        this.http.delete(`${this.apiUrl}/${item.id}`).subscribe();
      });
      this.cartItemsSubject.next([]);
      alert('Tous les éléments ont été supprimés');
    }),
    map(() => void 0),
    catchError((error) => {
      console.error('Erreur lors du vidage du panier :', error);
      return of(void 0);
    })
  );
}




  getCartSummary(): CartSummary {
    const items = this.cartItemsSubject.value;
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const shippingFee = subtotal > 0 ? 15 : 0; 
    const total = subtotal + shippingFee;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      shippingFee,
      total,
      itemCount
    };
  }


  getTotalItems(): number {
    return this.cartItemsSubject.value.reduce((sum, item) => sum + item.quantity, 0);
  }


  private findCartItemByGameId(gameId: number): CartItem | undefined {
    return this.cartItemsSubject.value.find(item => item.game.id === gameId);
  }
}

