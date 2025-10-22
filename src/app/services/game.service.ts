import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game } from '../Models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/games';

  constructor(private http: HttpClient) { }

  getAllGames(): Observable<Game[]> {
    return this.http.get<Game[]>(this.apiUrl);
  }

  getGameById(id: number): Observable<Game> {
    return this.http.get<Game>(`${this.apiUrl}/${id}`);
  }

  getGamesByPlatform(platform: string): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}?platform=${platform}`);
  }

  getGamesByGenre(genre: string): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}?genre=${genre}`);
  }

  getGamesOnPromo(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}?promo=true`);
  }


  searchGames(query: string): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}?title_like=${query}`);
  }


  addGame(game: Game): Observable<Game> {
    return this.http.post<Game>(this.apiUrl, game);
  }


  updateGame(id: number, game: Game): Observable<Game> {
    return this.http.put<Game>(`${this.apiUrl}/${id}`, game);
  }

 
  deleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  getGamesByRating(minRating: number = 0): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}?rating_gte=${minRating}&_sort=rating&_order=desc`);
  }


  getGamesByPrice(maxPrice?: number): Observable<Game[]> {
    let url = this.apiUrl;
    if (maxPrice !== undefined) {
      url += `?price_lte=${maxPrice}`;
    }
    return this.http.get<Game[]>(url);
  }
 
  getPopularGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}?popular=true&_sort=rating&_order=desc`);
  }

  getPromoGames(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}?promo=true&_sort=rating&_order=desc`);
  }
}