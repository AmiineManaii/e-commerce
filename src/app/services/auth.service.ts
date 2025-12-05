import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { User } from '../Models/user.model';
import { API_BASE_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = API_BASE_URL;
  
  constructor(private http: HttpClient) { }

  register(user: User): Observable<string> {
    return new Observable(observer => {
      
          this.http.post<{status: string, message: string, data: {user: User, token: string}}>(this.apiUrl+'/auth/register', user).subscribe({
            next: (response) => {
              console.log(response);
              if (response.message !== 'Utilisateur créé avec succès') {
                observer.error(response.message);
                return;
              }
              const { password, ...userWithoutPassword } = response.data.user;
              localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
              localStorage.setItem('token', response.data.token);
              observer.next(response.message);
              observer.complete();
            },
            error: (error) => {
              console.log(error);
              observer.error(error);
            }
          });
        
    });
  }

  login(email: string, password: string): Observable<User> {
    return new Observable(observer => {
      this.http.post<{status: string, message: string, data: {user: User, token: string}}>(`${this.apiUrl}/auth/login`, {email, password}).subscribe({
        next: (response) => {
          //console.log(response);
          const user = response.data.user;
          const token = response.data.token;

          
          if (response.message !== 'Connexion réussie') {
            observer.error(response.message);
            return;
          }

          const { password: _, ...userWithoutPassword } = user;
          localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
          localStorage.setItem('token', token);
          observer.next(userWithoutPassword);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  getCurrentUser(): {user: User, token: string} | null {
    const userJson = localStorage.getItem('currentUser');
    const token = localStorage.getItem('token');
    if (userJson) {
      try {
        return {user: JSON.parse(userJson), token: token || ''};
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur:', error);
        return null;
      }
    }
    return null;
  }

  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}`, userData,{
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).pipe(
      tap(() => {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
          localStorage.removeItem('currentUser');
          const currentUser = JSON.parse(userJson);
          const updatedUser = {id: currentUser.id, ...userData};
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
      })
    );
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}`).pipe(
      map(users => users.length > 0)
    );
  }

  getUsername(userId: string, token: string): Observable<{prenom: string, nom: string}> {
    //console.log(userId);
    
    return this.http.get<{status: string, message: string, data: User}>(`${this.apiUrl}/users/${userId}`,{
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      map(user => ({prenom: user.data.prenom, nom: user.data.nom}))
    );
  }
}