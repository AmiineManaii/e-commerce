import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Game } from '../Models/game.model';
import { API_BASE_URL } from '../app.config';

export const GAME_PLACEHOLDER = 'assets/games/cover/cyberpunk.jpg';

/** Normalise un jeu brut (json-server snake_case OU Spring camelCase) */
export function normalizeGame(raw: any): Game {
  if (!raw) return raw;
  const coverImage: string =
    raw.coverImage ?? raw.cover_image ?? raw.cover ?? GAME_PLACEHOLDER;
  const images: string[] = Array.isArray(raw.images) ? raw.images : [];
  return {
    ...raw,
    coverImage,
    cover_image: coverImage,
    images,
  } as Game;
}

/** Résout une URL d'image : http(s) telle quelle, /assets telle quelle, sinon préfixe assets */
export function resolveGameImage(src: string | null | undefined): string {
  if (!src || typeof src !== 'string' || src.trim() === '' || src === 'undefined' || src === '.undefined') {
    return GAME_PLACEHOLDER;
  }
  const s = src.trim();
  if (/^https?:\/\//i.test(s) || s.startsWith('data:') || s.startsWith('blob:')) {
    return s;
  }
  // Enlève un éventuel '.' parasite ('.' + '/assets/...' ou '.' + 'undefined')
  const clean = s.startsWith('.') && !s.startsWith('./assets') ? s.replace(/^\.+/, '') : s;
  if (clean.startsWith('/assets/')) return clean.substring(1); // 'assets/...' (base-href safe)
  if (clean.startsWith('assets/')) return clean;
  if (clean.startsWith('./assets/')) return clean.substring(2);
  if (clean.startsWith('/')) return clean.substring(1);
  return clean;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = API_BASE_URL + '/games';

  constructor(private http: HttpClient) { }

  /** Accepte à la fois le format Spring {status,message,data} et le format brut json-server */
  private unwrap<T>(response: any): T {
    if (response && typeof response === 'object' && 'data' in response && !Array.isArray(response)) {
      return response.data as T;
    }
    return response as T;
  }

  private unwrapArray(response: any): Game[] {
    const data = this.unwrap<any>(response);
    const list = Array.isArray(data) ? data : [];
    return list.map(normalizeGame);
  }

  private unwrapOne(response: any): Game {
    return normalizeGame(this.unwrap<any>(response));
  }

  getAllGames(): Observable<Game[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => this.unwrapArray(res)),
      catchError(err => {
        console.error('getAllGames:', err);
        return of([]);
      })
    );
  }

  getGameById(id: string): Observable<Game> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.unwrapOne(res))
    );
  }

  getGamesByPlatform(platform: string): Observable<Game[]> {
    return this.http.get<any>(`${this.apiUrl}?platform=${encodeURIComponent(platform)}`).pipe(
      map(res => this.unwrapArray(res)),
      catchError(() => of([]))
    );
  }

  getGamesByGenre(genre: string): Observable<Game[]> {
    return this.http.get<any>(`${this.apiUrl}?genre=${encodeURIComponent(genre)}`).pipe(
      map(res => this.unwrapArray(res)),
      catchError(() => of([]))
    );
  }

  getGamesOnPromo(): Observable<Game[]> {
    return this.http.get<any>(`${this.apiUrl}?promo=true`).pipe(
      map(res => this.unwrapArray(res)),
      catchError(err => {
        console.error('getGamesOnPromo:', err);
        return of([]);
      })
    );
  }

  getPopularGames(): Observable<Game[]> {
    return this.http.get<any>(`${this.apiUrl}?popular=true`).pipe(
      map(res => this.unwrapArray(res)),
      catchError(err => {
        console.error('getPopularGames:', err);
        return of([]);
      })
    );
  }

  searchGames(query: string): Observable<Game[]> {
    return this.http.get<any>(`${this.apiUrl}?q=${encodeURIComponent(query)}`).pipe(
      map(res => this.unwrapArray(res)),
      catchError(() => of([]))
    );
  }

  addGame(game: Game): Observable<Game> {
    return this.http.post<any>(this.apiUrl, game).pipe(
      map(res => this.unwrapOne(res))
    );
  }

  updateGame(id: string, game: Game): Observable<Game> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, game).pipe(
      map(res => this.unwrapOne(res))
    );
  }

  deleteGame(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getGamesByRating(minRating: number = 0): Observable<Game[]> {
    return this.getAllGames().pipe(
      map(games => (games || [])
        .filter(game => (game?.rating ?? 0) >= minRating)
        .sort((a, b) => b.rating - a.rating))
    );
  }

  getGamesByPrice(maxPrice?: number): Observable<Game[]> {
    return this.getAllGames().pipe(
      map(games => {
        const list = games || [];
        if (maxPrice !== undefined) {
          return list.filter(game => game.price <= maxPrice);
        }
        return list;
      })
    );
  }

  getPromoGames(): Observable<Game[]> {
    return this.getGamesOnPromo();
  }

  getGamesByTag(tag: string): Observable<Game[]> {
    return this.http.get<any>(`${this.apiUrl}?tags_like=${encodeURIComponent(tag)}`).pipe(
      map(res => this.unwrapArray(res)),
      catchError(() => of([]))
    );
  }
}
