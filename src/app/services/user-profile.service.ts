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

  getUserProfile(userId: string): Observable<User> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: User}>(`${this.apiUrl}/users/${userId}`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  updateUserProfile(userId: string, userData: Partial<User>): Observable<User> {
    return new Observable(observer => {
      // Récupérer d'abord l'utilisateur existant
      this.getUserProfile(userId).subscribe({
        next: (existingUser) => {
          // Fusionner les modifications
          const updatedUser = {
            ...existingUser,
            ...userData
          };
          
          this.http.put<{status: string, message: string, data: User}>(`${this.apiUrl}/users/${userId}`, updatedUser)
            .subscribe({
              next: (response) => {
                observer.next(response.data);
                observer.complete();
              },
              error: (error) => observer.error(error)
            });
        },
        error: (error) => observer.error(error)
      });
    });
  }

  getAddresses(userId: string): Observable<Address[]> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Address[]}>(`${this.apiUrl}/addresses/user/${userId}`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  addAddress(address: Address): Observable<Address> {
    return new Observable(observer => {
      this.http.post<{status: string, message: string, data: Address}>(`${this.apiUrl}/addresses`, address)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  updateAddress(addressId: string, addressData: Partial<Address>): Observable<Address> {
    return new Observable(observer => {
      // D'abord récupérer l'adresse existante
      this.http.get<{status: string, message: string, data: Address}>(`${this.apiUrl}/addresses/${addressId}`)
        .subscribe({
          next: (response) => {
            const existingAddress = response.data;
            // Fusionner les modifications
            const updatedAddress = {
              ...existingAddress,
              ...addressData
            };
            
            this.http.put<{status: string, message: string, data: Address}>(`${this.apiUrl}/addresses/${addressId}`, updatedAddress)
              .subscribe({
                next: (response) => {
                  observer.next(response.data);
                  observer.complete();
                },
                error: (error) => observer.error(error)
              });
          },
          error: (error) => observer.error(error)
        });
    });
  }

  deleteAddress(addressId: string): Observable<void> {
    return new Observable(observer => {
      this.http.delete<{status: string, message: string, data: null}>(`${this.apiUrl}/addresses/${addressId}`)
        .subscribe({
          next: () => {
            observer.next();
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  setDefaultAddress(userId: string, addressId: string): Observable<Address> {
    return new Observable(observer => {
      // Votre API Spring Boot a un endpoint spécifique pour définir une adresse par défaut
      this.http.patch<{status: string, message: string, data: Address}>(`${this.apiUrl}/addresses/${addressId}/default`, {})
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  getOrders(userId: string): Observable<Order[]> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Order[]}>(`${this.apiUrl}/orders/user/${userId}`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  getOrderDetails(orderId: string): Observable<Order> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Order}>(`${this.apiUrl}/orders/${orderId}`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  createOrder(order: Order): Observable<Order> {
    return new Observable(observer => {
      this.http.post<{status: string, message: string, data: Order}>(`${this.apiUrl}/orders`, order)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  getWishlist(userId: string): Observable<string[]> {
    return new Observable(observer => {
      this.getUserProfile(userId).subscribe({
        next: (user) => {
          observer.next(user.wishlist?.map(item => item.toString()) || []);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  addToWishlist(userId: string, gameId: string): Observable<User> {
    return new Observable(observer => {
      this.http.post<{status: string, message: string, data: User}>(`${this.apiUrl}/users/${userId}/wishlist/${gameId}`, {})
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
            this.wishlistChanged.next();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  removeFromWishlist(userId: string, gameId: string): Observable<User> {
    return new Observable(observer => {
      this.http.delete<{status: string, message: string, data: User}>(`${this.apiUrl}/users/${userId}/wishlist/${gameId}`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
            this.wishlistChanged.next();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  isInWishlist(userId: string, gameId: string): Observable<boolean> {
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