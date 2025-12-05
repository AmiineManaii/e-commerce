import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, Subject, switchMap, of } from 'rxjs';
import { CartItem, CartSummary } from '../Models/cart-item.model';
import { Game } from '../Models/game.model';
import { API_BASE_URL } from '../app.config';
import { AuthService } from './auth.service';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = API_BASE_URL + '/cart';
  private cartChanged = new Subject<void>();
  private guestSessionId: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private gameService: GameService
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

  private getAuthHeaders(): { [header: string]: string } {
    const currentUser = this.authService.getCurrentUser();
    const token = currentUser?.token;
    
    if (token) {
      return {
        'Authorization': `Bearer ${token}`
      };
    }
    return {};
  }

  private isAuthenticated(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return !!currentUser?.user;
  }

  getCartChanges(): Observable<void> {
    return this.cartChanged.asObservable();
  }

  getCartItems(): Observable<CartItem[]> {
    if (this.isAuthenticated()) {
      // Utilisateur connecté - avec token
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.user?.id;
      
      return this.http.get<{ status: string, message: string, data: any[] }>(
        `${this.apiUrl}/user/${userId}`,
        { headers: this.getAuthHeaders() }
      ).pipe(
        switchMap(response => {
          const gameObservables = response.data.map(item => this.getGameById(item.gameId));
          return forkJoin(gameObservables).pipe(
            map(games => {
              return response.data.map((item, index) => ({
                id: item.id,
                userId: userId,
                gameId: item.gameId,
                game: games[index],
                quantity: item.quantity,
                subtotal: item.subtotal,
                createdAt: item.createdAt
              }));
            })
          );
        })
      );
    } else {
      // Invité - sans token
      return this.http.get<{ status: string, message: string, data: any[] }>(
        `${this.apiUrl}/session/${this.guestSessionId}`
      ).pipe(
        switchMap(response => {
          const gameObservables = response.data.map(item => this.getGameById(item.gameId));
          return forkJoin(gameObservables).pipe(
            map(games => {
              return response.data.map((item, index) => ({
                id: item.id,
                sessionId: this.guestSessionId,
                gameId: item.gameId,
                game: games[index],
                quantity: item.quantity,
                subtotal: item.subtotal,
                createdAt: item.createdAt
              }));
            })
          );
        })
      );
    }
  }

  addToCart(game: Game, quantity: number = 1): Observable<CartItem> {
    if (this.isAuthenticated()) {
      // Utilisateur connecté
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.user?.id;
      
      const newItem = {
        userId: userId,
        gameId: game.id,
        quantity: quantity,
        subtotal: game.price * quantity,
        createdAt: new Date().toISOString()
      };
      
      return this.http.post<{ status: string, message: string, data: any }>(
        `${this.apiUrl}/user`,
        newItem,
        { headers: this.getAuthHeaders() }
      ).pipe(
        map(response => {
          const result: CartItem = {
            id: response.data.id,
            userId: userId,
            gameId: response.data.gameId,
            game: game,
            quantity: response.data.quantity,
            subtotal: response.data.subtotal,
            createdAt: response.data.createdAt
          };
          this.cartChanged.next();
          return result;
        })
      );
    } else {
      // Invité - pas de token
      const newItem = {
        sessionId: this.guestSessionId,
        gameId: game.id,
        quantity: quantity,
        subtotal: game.price * quantity,
        createdAt: new Date().toISOString()
      };
      
      return this.http.post<{ status: string, message: string, data: any }>(
        `${this.apiUrl}/session/${this.guestSessionId}`,
        newItem
      ).pipe(
        map(response => {
          const result: CartItem = {
            id: response.data.id,
            sessionId: this.guestSessionId,
            gameId: response.data.gameId,
            game: game,
            quantity: response.data.quantity,
            subtotal: response.data.subtotal,
            createdAt: response.data.createdAt
          };
          this.cartChanged.next();
          return result;
        })
      );
    }
  }

  updateQuantity(itemId: string, quantity: number): Observable<CartItem> {
    if (this.isAuthenticated()) {
      // Utilisateur connecté - avec token
      return this.http.put<{ status: string, message: string, data: any }>(
        `${this.apiUrl}/item/${itemId}`,
        { quantity: quantity },
        { headers: this.getAuthHeaders() }
      ).pipe(
        switchMap(response => {
          return this.getGameById(response.data.gameId).pipe(
            map(game => {
              const result: CartItem = {
                id: response.data.id,
                userId: response.data.userId,
                gameId: response.data.gameId,
                game: game,
                quantity: response.data.quantity,
                subtotal: response.data.subtotal,
                createdAt: response.data.createdAt
              };
              this.cartChanged.next();
              return result;
            })
          );
        })
      );
    } else {
      // Invité - sans token
      return this.http.put<{ status: string, message: string, data: any }>(
        `${this.apiUrl}/session/${this.guestSessionId}/item/${itemId}`,
        { quantity: quantity }
      ).pipe(
        switchMap(response => {
          return this.getGameById(response.data.gameId).pipe(
            map(game => {
              const result: CartItem = {
                id: response.data.id,
                sessionId: this.guestSessionId,
                gameId: response.data.gameId,
                game: game,
                quantity: response.data.quantity,
                subtotal: response.data.subtotal,
                createdAt: response.data.createdAt
              };
              this.cartChanged.next();
              return result;
            })
          );
        })
      );
    }
  }

  removeFromCart(itemId: string): Observable<void> {
    if (this.isAuthenticated()) {
      // Utilisateur connecté - avec token
      return this.http.delete<{ status: string, message: string, data: null }>(
        `${this.apiUrl}/item/${itemId}`,
        { headers: this.getAuthHeaders() }
      ).pipe(
        map(() => {
          this.cartChanged.next();
          return;
        })
      );
    } else {
      // Invité - sans token
      return this.http.delete<{ status: string, message: string, data: null }>(
        `${this.apiUrl}/session/${this.guestSessionId}/item/${itemId}`
      ).pipe(
        map(() => {
          this.cartChanged.next();
          return;
        })
      );
    }
  }

  clearCart(): Observable<void> {
    if (this.isAuthenticated()) {
      // Utilisateur connecté
      const currentUser = this.authService.getCurrentUser();
      const userId = currentUser?.user?.id;
      
      return this.http.delete<{ status: string, message: string, data: null }>(
        `${this.apiUrl}/user/${userId}`,
        { headers: this.getAuthHeaders() }
      ).pipe(
        map(() => {
          this.cartChanged.next();
          return;
        })
      );
    } else {
      // Invité
      return this.http.delete<{ status: string, message: string, data: null }>(
        `${this.apiUrl}/session/${this.guestSessionId}`
      ).pipe(
        map(() => {
          this.cartChanged.next();
          return;
        })
      );
    }
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

  getGameById(id: string): Observable<Game> {
    return this.gameService.getGameById(id);
  }

  // Méthode pour migrer le panier de guest vers utilisateur lors de la connexion
  migrateGuestCartToUser(): Observable<void> {
    if (!this.isAuthenticated()) {
      return of(void 0);
    }

    const currentUser = this.authService.getCurrentUser();
    const userId = currentUser?.user?.id;
    
    return this.http.post<{ status: string, message: string, data: any }>(
      `${this.apiUrl}/migrate/${this.guestSessionId}/${userId}`,
      {},
      { headers: this.getAuthHeaders() }
    ).pipe(
      map(() => {
        // Après migration, on nettoie la session guest
        this.clearGuestSession();
        this.cartChanged.next();
        return;
      })
    );
  }
}