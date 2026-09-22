import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { User } from '../Models/user.model';
import { API_BASE_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = API_BASE_URL;

  constructor(private http: HttpClient) { }

  private unwrap<T>(response: any): T {
    if (response && typeof response === 'object' && !Array.isArray(response) && 'data' in response) {
      return response.data as T;
    }
    return response as T;
  }

  private stripPassword(user: any): User {
    if (!user) return user;
    const { password, ...rest } = user;
    return rest as User;
  }

  register(user: User): Observable<User> {
    return this.http.post<any>(this.apiUrl + '/users', user).pipe(
      map(response => {
        const created = this.unwrap<User>(response);
        const clean = this.stripPassword(created);
        localStorage.setItem('currentUser', JSON.stringify(clean));
        return clean;
      }),
      catchError(error => {
        console.error('register:', error);
        return throwError(() => error);
      })
    );
  }

  login(email: string, password: string): Observable<User> {
    // json-server : pas de /users/email/:email -> on filtre par ?email=
    return this.http.get<any>(`${this.apiUrl}/users?email=${encodeURIComponent(email)}`).pipe(
      switchMap(response => {
        const users = Array.isArray(response) ? response : [this.unwrap<User>(response)].filter(Boolean);
        const user = users[0];

        if (!user) {
          return throwError(() => new Error('Utilisateur non trouvé'));
        }
        if (user.password !== password) {
          return throwError(() => new Error('Mot de passe incorrect'));
        }
        const clean = this.stripPassword(user);
        localStorage.setItem('currentUser', JSON.stringify(clean));
        return of(clean);
      }),
      catchError(error => {
        console.error('login:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur:', error);
        return null;
      }
    }
    return null;
  }

  updateUser(userId: number | string, userData: Partial<User>): Observable<User> {
    return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, userData).pipe(
      map(response => {
        const updated = this.unwrap<User>(response);
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
          try {
            const currentUser = JSON.parse(userJson);
            const merged = { ...currentUser, ...this.stripPassword(updated), ...this.stripPassword(userData) };
            localStorage.setItem('currentUser', JSON.stringify(merged));
          } catch { /* ignore */ }
        }
        return updated;
      })
    );
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<any[]>(`${this.apiUrl}/users?email=${encodeURIComponent(email)}`).pipe(
      map(users => Array.isArray(users) ? users.length > 0 : !!users),
      catchError(() => of(false))
    );
  }

  getUsername(userId: string): Observable<{prenom: string, nom: string}> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}`).pipe(
      map(response => {
        const user = this.unwrap<User>(response);
        return { prenom: user?.prenom ?? '', nom: user?.nom ?? '' };
      })
    );
  }
}
