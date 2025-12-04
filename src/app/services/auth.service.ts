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

  register(user: User): Observable<User> {
    return new Observable(observer => {
      
          this.http.post<{status: string, message: string, data: User}>(this.apiUrl+'/users', user).subscribe({
            next: (response) => {
              console.log(response);
              const { password, ...userWithoutPassword } = response.data;
              localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
              observer.next(userWithoutPassword);
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
      this.http.get<{status: string, message: string, data: User}>(`${this.apiUrl}/users/email/${email}`).subscribe({
        next: (response) => {
          console.log(response.data);
          const user = response.data;

          console.log(!user);
          if (!user) {
            observer.error('Utilisateur non trouvé');
            return;
          }

          if (user.password !== password) {
            observer.error('Mot de passe incorrect');
            return;
          }

          const { password: _, ...userWithoutPassword } = user;
          localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
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

  updateUser(userId: number, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}`, userData).pipe(
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

  getUsername(userId: string): Observable<{prenom: string, nom: string}> {
    //console.log(userId);
    return this.http.get<{status: string, message: string, data: User}>(`${this.apiUrl}/users/${userId}`).pipe(
      map(user => ({prenom: user.data.prenom, nom: user.data.nom}))
    );
  }
}