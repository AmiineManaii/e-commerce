import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { User, Address, Order } from '../Models/user.model';
import { API_BASE_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = API_BASE_URL;
  private wishlistChanged = new Subject<void>();

  constructor(private http: HttpClient) { }


  getUserProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

  updateUserProfile(userId: number, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, userData);
  }


  getAddresses(userId: number): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/addresses?userId=${userId}`);
  }


  addAddress(address: Address): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/addresses`, address);
  }


  updateAddress(addressId: number, addressData: Partial<Address>): Observable<Address> {
    return this.http.patch<Address>(`${this.apiUrl}/addresses/${addressId}`, addressData);
  }

  deleteAddress(addressId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/addresses/${addressId}`);
  }

  setDefaultAddress(userId: number, addressId: number): Observable<Address> {
    return new Observable(observer => {
      
      this.getAddresses(userId).subscribe({
        next: (addresses) => {
          
          const updatePromises = addresses.map(address => {
            if (address.default && address.id !== addressId) {
              return this.updateAddress(address.id!, { default: false }).toPromise();
            }
            return Promise.resolve();
          });

          // Attendre que toutes les mises à jour soient terminées
          Promise.all(updatePromises).then(() => {
            // Définir la nouvelle adresse par défaut
            this.updateAddress(addressId, { default: true }).subscribe({
              next: (updatedAddress) => {
                observer.next(updatedAddress);
                observer.complete();
              },
              error: (error) => {
                observer.error(error);
              }
            });
          });
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

 
  getOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders?userId=${userId}`);
  }

  getOrderDetails(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`);
  }

 
  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, order);
  }


  getWishlist(userId: number): Observable<number[]> {
    return new Observable(observer => {
      
      this.http.get<User>(`${this.apiUrl}/users/${userId}`).subscribe({
        next: (user) => {
          observer.next(user.wishlist || []);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  addToWishlist(userId: number, gameId: number): Observable<User> {
    return new Observable(observer => {
    
      this.getWishlist(userId).subscribe({
        next: (currentWishlist) => {
          
          if (currentWishlist.includes(gameId)) {
            observer.next({} as User);
            observer.complete();

            return;
          }

         
          const updatedWishlist = [...currentWishlist, gameId];
          

          this.http.patch<User>(`${this.apiUrl}/users/${userId}`, {
            wishlist: updatedWishlist
          }).subscribe({
            next: (user) => {
              observer.next(user);
              observer.complete();
              this.wishlistChanged.next();
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

  removeFromWishlist(userId: number, gameId: number): Observable<User> {
    return new Observable(observer => {
    
      this.getWishlist(userId).subscribe({
        next: (currentWishlist) => {
       
          const updatedWishlist = currentWishlist.filter(id => id !== gameId);
          
         
          this.http.patch<User>(`${this.apiUrl}/users/${userId}`, {
            wishlist: updatedWishlist
          }).subscribe({
            next: (user) => {
              observer.next(user);
              observer.complete();
              this.wishlistChanged.next();
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

  isInWishlist(userId: number, gameId: number): Observable<boolean> {
    return new Observable(observer => {
      this.getWishlist(userId).subscribe({
        next: (wishlist) => {
          observer.next(wishlist.includes(gameId));
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }
  getWishlistChanges(): Observable<void> {
  return this.wishlistChanged.asObservable();
}

}