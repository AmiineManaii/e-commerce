import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, Subject, switchMap } from 'rxjs';
import { User, Address, Order } from '../Models/user.model';
import { API_BASE_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = API_BASE_URL;
  private wishlistChanged = new Subject<void>();

  constructor(private http: HttpClient) { }

  private unwrap<T>(response: any): T {
    if (response && typeof response === 'object' && !Array.isArray(response) && 'data' in response) {
      return response.data as T;
    }
    return response as T;
  }

  private unwrapArray<T>(response: any): T[] {
    const data = this.unwrap<any>(response);
    return Array.isArray(data) ? data : [];
  }

  private notifyWishlist(): void {
    this.wishlistChanged.next();
  }

  getWishlistChanges(): Observable<void> {
    return this.wishlistChanged.asObservable();
  }

  getUserProfile(userId: string): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`).pipe(
      map(res => this.unwrap<User>(res))
    );
  }

  updateUserProfile(userId: string, userData: Partial<User>): Observable<User> {
    // json-server : PATCH suffit (pas besoin de GET + PUT)
    return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, userData).pipe(
      map(res => this.unwrap<User>(res))
    );
  }

  getAddresses(userId: string): Observable<Address[]> {
    // Spring: /addresses/user/:id | json-server: /addresses?userId=:id
    return this.http.get<any>(`${this.apiUrl}/addresses?userId=${encodeURIComponent(userId)}`).pipe(
      map(res => this.unwrapArray<Address>(res)),
      catchError(err => {
        console.error('getAddresses:', err);
        return of([]);
      })
    );
  }

  addAddress(address: Address): Observable<Address> {
    return this.http.post<any>(`${this.apiUrl}/addresses`, address).pipe(
      map(res => this.unwrap<Address>(res))
    );
  }

  updateAddress(addressId: string, addressData: Partial<Address>): Observable<Address> {
    return this.http.patch<any>(`${this.apiUrl}/addresses/${addressId}`, addressData).pipe(
      map(res => this.unwrap<Address>(res))
    );
  }

  deleteAddress(addressId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/addresses/${addressId}`);
  }

  setDefaultAddress(userId: string, addressId: string): Observable<Address> {
    // Essaie l'endpoint Spring, sinon bascule en logique json-server
    return this.http.patch<any>(`${this.apiUrl}/addresses/${addressId}/default`, {}).pipe(
      map(res => this.unwrap<Address>(res)),
      catchError(() => {
        return this.getAddresses(userId).pipe(
          switchMap(addresses => {
            const resets = (addresses || [])
              .filter(a => a.id?.toString() !== addressId)
              .map(a => this.http.patch<any>(`${this.apiUrl}/addresses/${a.id}`, { default: false }).pipe(catchError(() => of(a))));
            const setDefault$ = this.http.patch<any>(`${this.apiUrl}/addresses/${addressId}`, { default: true }).pipe(
              map(res => this.unwrap<Address>(res))
            );
            if (resets.length === 0) return setDefault$;
            return forkJoin(resets).pipe(switchMap(() => setDefault$));
          })
        );
      })
    );
  }

  getOrders(userId: string): Observable<Order[]> {
    return this.http.get<any>(`${this.apiUrl}/orders?userId=${encodeURIComponent(userId)}`).pipe(
      map(res => this.unwrapArray<Order>(res)),
      catchError(err => {
        console.error('getOrders:', err);
        return of([]);
      })
    );
  }

  getOrderDetails(orderId: string): Observable<Order> {
    return this.http.get<any>(`${this.apiUrl}/orders/${orderId}`).pipe(
      map(res => this.unwrap<Order>(res))
    );
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<any>(`${this.apiUrl}/orders`, order).pipe(
      map(res => this.unwrap<Order>(res))
    );
  }

  getWishlist(userId: string): Observable<string[]> {
    return this.getUserProfile(userId).pipe(
      map(user => {
        const w = (user as any)?.wishlist;
        if (!Array.isArray(w)) return [];
        return w.map((item: any) => item?.toString());
      }),
      catchError(err => {
        console.error('getWishlist:', err);
        return of([]);
      })
    );
  }

  addToWishlist(userId: string, gameId: string): Observable<User> {
    // Essaie endpoint Spring, sinon PATCH json-server sur le tableau wishlist
    return this.http.post<any>(`${this.apiUrl}/users/${userId}/wishlist/${gameId}`, {}).pipe(
      map(res => {
        const u = this.unwrap<User>(res);
        this.notifyWishlist();
        return u;
      }),
      catchError(() => {
        return this.getUserProfile(userId).pipe(
          switchMap(user => {
            const current: any[] = Array.isArray((user as any)?.wishlist) ? [...(user as any).wishlist] : [];
            if (!current.map(String).includes(String(gameId))) current.push(gameId);
            return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, { wishlist: current }).pipe(
              map(res => {
                const u = this.unwrap<User>(res);
                this.notifyWishlist();
                return u;
              })
            );
          })
        );
      })
    );
  }

  removeFromWishlist(userId: string, gameId: string): Observable<User> {
    return this.http.delete<any>(`${this.apiUrl}/users/${userId}/wishlist/${gameId}`).pipe(
      map(res => {
        const u = this.unwrap<User>(res);
        this.notifyWishlist();
        return u;
      }),
      catchError(() => {
        return this.getUserProfile(userId).pipe(
          switchMap(user => {
            const current: any[] = Array.isArray((user as any)?.wishlist)
              ? (user as any).wishlist.filter((id: any) => String(id) !== String(gameId))
              : [];
            return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, { wishlist: current }).pipe(
              map(res => {
                const u = this.unwrap<User>(res);
                this.notifyWishlist();
                return u;
              })
            );
          })
        );
      })
    );
  }

  isInWishlist(userId: string, gameId: string): Observable<boolean> {
    return this.getWishlist(userId).pipe(
      map(wishlist => (wishlist || []).includes(gameId)),
      catchError(() => of(false))
    );
  }
}
