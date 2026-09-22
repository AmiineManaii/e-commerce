import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, Subject, switchMap } from 'rxjs';
import { CartItem, CartSummary } from '../Models/cart-item.model';
import { Game } from '../Models/game.model';
import { API_BASE_URL } from '../app.config';
import { AuthService } from './auth.service';
import { normalizeGame } from './game.service';

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
    let sessionId: string | null = null;
    try {
      sessionId = localStorage.getItem('guestSessionId');
    } catch { /* ignore */ }
    if (!sessionId) {
      sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
      try { localStorage.setItem('guestSessionId', sessionId); } catch { /* ignore */ }
    }
    return sessionId;
  }

  private unwrap<T>(response: any): T {
    if (response && typeof response === 'object' && !Array.isArray(response) && 'data' in response) {
      return response.data as T;
    }
    return response as T;
  }

  private unwrapArray(response: any): any[] {
    const data = this.unwrap<any>(response);
    return Array.isArray(data) ? data : [];
  }

  getCartChanges(): Observable<void> {
    return this.cartChanged.asObservable();
  }

  getCartItems(): Observable<CartItem[]> {
    const user = this.authService.getCurrentUser();
    const currentGuestSessionId = localStorage.getItem('guestSessionId') || this.guestSessionId;

    return this.http.get<any>(this.apiUrl).pipe(
      map(res => {
        const raw = this.unwrapArray(res);
        const filtered = raw.filter(item => {
          if (!item) return false;
          if (user?.id) {
            return String(item.userId) === String(user.id);
          } else {
            return item.sessionId === currentGuestSessionId;
          }
        });
        return filtered.map(item => ({
          ...item,
          game: item?.game ? normalizeGame(item.game) : item.game
        }));
      }),
      catchError(err => {
        console.error('getCartItems:', err);
        return of([]);
      })
    );
  }

  addToCart(game: Game, quantity: number = 1): Observable<CartItem> {
    const user = this.authService.getCurrentUser();
    const currentGuestSessionId = localStorage.getItem('guestSessionId') || this.guestSessionId;

    return this.getCartItems().pipe(
      switchMap(items => {
        const existingItem = (items || []).find(item => String(item?.game?.id) === String((game as any)?.id));
        if (existingItem) {
          return this.updateQuantity(existingItem.id, existingItem.quantity + quantity);
        }
        const newItem: any = {
          game,
          quantity,
          subtotal: ((game as any).price || 0) * quantity,
          createdAt: new Date().toISOString(),
          ...(user?.id ? { userId: user.id } : { sessionId: currentGuestSessionId })
        };
        return this.http.post<any>(this.apiUrl, newItem).pipe(
          map(res => {
            const created = this.unwrap<any>(res);
            this.cartChanged.next();
            return created as CartItem;
          })
        );
      }),
      catchError(err => {
        console.error('addToCart:', err);
        throw err;
      })
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<CartItem> {
    return this.http.get<any>(`${this.apiUrl}/${itemId}`).pipe(
      switchMap(res => {
        const currentItem = this.unwrap<any>(res);
        const updatedItem = {
          ...currentItem,
          quantity,
          subtotal: (currentItem?.game?.price ?? 0) * quantity
        };
        return this.http.put<any>(`${this.apiUrl}/${itemId}`, updatedItem).pipe(
          map(r => {
            const result = this.unwrap<any>(r) as CartItem;
            this.cartChanged.next();
            return result;
          })
        );
      })
    );
  }

  removeFromCart(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${itemId}`).pipe(
      map(() => {
        this.cartChanged.next();
      })
    );
  }

  clearCart(): Observable<void> {
    return this.getCartItems().pipe(
      switchMap(items => {
        if (!items || items.length === 0) {
          this.cartChanged.next();
          return of(void 0);
        }
        const deletes = items.map(item =>
          this.http.delete<void>(`${this.apiUrl}/${item.id}`).pipe(catchError(() => of(void 0)))
        );
        return forkJoin(deletes).pipe(
          map(() => {
            this.cartChanged.next();
          })
        );
      }),
      catchError(err => {
        console.error('clearCart:', err);
        return of(void 0);
      })
    );
  }

  mergeGuestCartOnLogin(): Observable<void> {
    const user = this.authService.getCurrentUser();
    if (!user?.id) return of(void 0);

    const currentGuestSessionId = localStorage.getItem('guestSessionId') || this.guestSessionId;

    return this.http.get<any>(this.apiUrl).pipe(
      map(res => this.unwrapArray(res)),
      switchMap((allCartItems: any[]) => {
        const guestItems = (allCartItems || []).filter(item => item && item.sessionId === currentGuestSessionId);
        const userItems = (allCartItems || []).filter(item => item && String(item.userId) === String(user.id));

        if (!guestItems || guestItems.length === 0) {
          this.clearGuestSession();
          return of(void 0);
        }

        const ops = guestItems.map(g => {
          const same = userItems.find(m => String(m?.game?.id) === String(g?.game?.id));
          if (same) {
            const newQty = (same.quantity || 1) + (g.quantity || 1);
            const updatedSame = {
              ...same,
              quantity: newQty,
              subtotal: (same.game?.price || 0) * newQty
            };
            return this.http.put<void>(`${this.apiUrl}/${same.id}`, updatedSame).pipe(
              switchMap(() => this.http.delete<void>(`${this.apiUrl}/${g.id}`).pipe(catchError(() => of(void 0)))),
              map(() => void 0)
            );
          } else {
            const movedItem: any = {
              ...g,
              userId: user.id
            };
            delete movedItem.sessionId;
            return this.http.put<void>(`${this.apiUrl}/${g.id}`, movedItem).pipe(
              map(() => void 0),
              catchError(() => of(void 0))
            );
          }
        });

        return forkJoin(ops).pipe(map(() => void 0));
      }),
      map(() => {
        this.clearGuestSession();
        this.cartChanged.next();
      }),
      catchError(err => {
        console.error('mergeGuestCartOnLogin:', err);
        return of(void 0);
      })
    );
  }

  getCartSummary(): Observable<CartSummary> {
    return this.getCartItems().pipe(
      map(items => {
        const list = items || [];
        const subtotal = list.reduce((sum, item) => sum + (item?.subtotal ?? 0), 0);
        const shippingFee = subtotal > 100 ? 15 : 0;
        const total = subtotal + shippingFee;
        const itemCount = list.reduce((sum, item) => sum + (item?.quantity ?? 0), 0);
        return { subtotal, shippingFee, total, itemCount };
      })
    );
  }

  getTotalItems(): Observable<number> {
    return this.getCartItems().pipe(
      map(items => (items || []).reduce((sum, item) => sum + (item?.quantity ?? 0), 0))
    );
  }

  clearGuestSession(): void {
    this.guestSessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    try { localStorage.setItem('guestSessionId', this.guestSessionId); } catch { /* ignore */ }
  }
}
