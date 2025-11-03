import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { User } from '../Models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) { }



  register(user: User): Observable<User> {
    return new Observable(observer => {
      
      this.http.get<User[]>(`${this.apiUrl}?email=${user.email}`).subscribe({
        next: (users) => {
          if (users.length > 0) {
            observer.error({message: 'Cet email est deja existe'});
            return;
          }
          

          this.http.post<User>(this.apiUrl, user).subscribe({
            next: (createdUser) => {
              const { password, ...userWithoutPassword } = createdUser;
              localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
              observer.next(userWithoutPassword);
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

 
  login(email: string, password: string): Observable<User> {
    return new Observable(observer => {

      this.http.get<User[]>(`${this.apiUrl}?email=${email}`).subscribe({
        next: (users) => {
          const user = users[0];
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
}