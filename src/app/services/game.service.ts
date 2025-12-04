import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game } from '../Models/game.model';
import { API_BASE_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = API_BASE_URL + '/games';

  constructor(private http: HttpClient) { }

  getAllGames(): Observable<Game[]> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Game[]}>(this.apiUrl)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  getGameById(id: string): Observable<Game> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Game}>(`${this.apiUrl}/${id}`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  getGamesByPlatform(platform: string): Observable<Game[]> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Game[]}>(`${this.apiUrl}/platform/${platform}`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  getGamesByGenre(genre: string): Observable<Game[]> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Game[]}>(`${this.apiUrl}/genre/${genre}`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  getGamesOnPromo(): Observable<Game[]> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Game[]}>(`${this.apiUrl}/promo`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  getPopularGames(): Observable<Game[]> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Game[]}>(`${this.apiUrl}/popular`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  searchGames(query: string): Observable<Game[]> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Game[]}>(`${this.apiUrl}/search?q=${query}`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  addGame(game: Game): Observable<Game> {
    return new Observable(observer => {
      this.http.post<{status: string, message: string, data: Game}>(this.apiUrl, game)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  updateGame(id: string, game: Game): Observable<Game> {
    return new Observable(observer => {
      this.http.put<{status: string, message: string, data: Game}>(`${this.apiUrl}/${id}`, game)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  deleteGame(id: string): Observable<void> {
    return new Observable(observer => {
      this.http.delete<{status: string, message: string, data: null}>(`${this.apiUrl}/${id}`)
        .subscribe({
          next: () => {
            observer.next();
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  getGamesByRating(minRating: number = 0): Observable<Game[]> {
    return new Observable(observer => {
      this.getAllGames().subscribe({
        next: (games) => {
          const filteredGames = games.filter(game => game.rating >= minRating)
            .sort((a, b) => b.rating - a.rating);
          observer.next(filteredGames);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  getGamesByPrice(maxPrice?: number): Observable<Game[]> {
    return new Observable(observer => {
      this.getAllGames().subscribe({
        next: (games) => {
          let filteredGames = games;
          if (maxPrice !== undefined) {
            filteredGames = games.filter(game => game.price <= maxPrice);
          }
          observer.next(filteredGames);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  getPromoGames(): Observable<Game[]> {
    return this.getGamesOnPromo();
  }

  // Méthode supplémentaire pour les tags (si vous en avez besoin)
  getGamesByTag(tag: string): Observable<Game[]> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Game[]}>(`${this.apiUrl}/tag/${tag}`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }
}