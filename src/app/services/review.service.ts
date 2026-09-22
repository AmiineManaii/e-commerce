import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { Review } from '../Models/review';
import { API_BASE_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = API_BASE_URL + '/reviews';

  constructor(private http: HttpClient) { }

  private unwrap<T>(response: any): T {
    if (response && typeof response === 'object' && !Array.isArray(response) && 'data' in response) {
      return response.data as T;
    }
    return response as T;
  }

  private unwrapArray<T>(response: any): T[] {
    const data = this.unwrap<any>(response);
    return Array.isArray(data) ? data : [];
  }

  /** Normalise : accepte gameId/userId plats OU game/user imbriqués */
  private normalizeReview(raw: any): Review {
    if (!raw) return raw;
    const gameId = raw.gameId ?? raw.game?.id;
    const userId = raw.userId ?? raw.user?.id;
    return {
      ...raw,
      gameId: gameId != null ? String(gameId) : raw.gameId,
      userId: userId != null ? String(userId) : raw.userId,
    } as Review;
  }

  private normalizeList(res: any): Review[] {
    return this.unwrapArray<any>(res).map(r => this.normalizeReview(r));
  }

  getReviews(): Observable<Review[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => this.normalizeList(res)),
      catchError(err => {
        console.error('getReviews:', err);
        return of([]);
      })
    );
  }

  getReviewById(id: string): Observable<Review> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.normalizeReview(this.unwrap<any>(res)))
    );
  }

  getReviewsByGameId(gameId: string): Observable<Review[]> {
    // json-server: /reviews?gameId= (les avis en base sont au format plat gameId/userId)
    return this.http.get<any>(`${this.apiUrl}?gameId=${encodeURIComponent(gameId)}`).pipe(
      switchMap(res => {
        const list = this.normalizeList(res);
        if (list.length > 0) return of(list);
        // Fallback client : filtre sur gameId OU game.id (number vs string, imbriqué vs plat)
        return this.getReviews().pipe(
          map(all => (all || []).filter(r => String((r as any)?.gameId ?? (r as any)?.game?.id) === String(gameId)))
        );
      }),
      catchError(() => {
        return this.getReviews().pipe(
          map(all => (all || []).filter(r => String((r as any)?.gameId ?? (r as any)?.game?.id) === String(gameId)))
        );
      })
    );
  }

  getReviewsByUserId(userId: string): Observable<Review[]> {
    return this.http.get<any>(`${this.apiUrl}?userId=${encodeURIComponent(userId)}`).pipe(
      map(res => this.normalizeList(res)),
      catchError(() => {
        return this.getReviews().pipe(
          map(all => (all || []).filter(r => String((r as any)?.userId ?? (r as any)?.user?.id) === String(userId)))
        );
      })
    );
  }

  createReview(review: Omit<Review, 'id'>): Observable<Review> {
    return this.http.post<any>(this.apiUrl, review).pipe(
      map(res => this.normalizeReview(this.unwrap<any>(res)))
    );
  }

  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    return this.getReviewById(id).pipe(
      switchMap(existing => {
        const updated = { ...existing, ...review };
        return this.http.put<any>(`${this.apiUrl}/${id}`, updated).pipe(
          map(res => this.normalizeReview(this.unwrap<any>(res)))
        );
      })
    );
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getVerifiedReviews(): Observable<Review[]> {
    return this.http.get<any>(`${this.apiUrl}?verified=true`).pipe(
      map(res => this.unwrapArray<Review>(res)),
      catchError(() => {
        return this.getReviews().pipe(map(all => (all || []).filter(r => (r as any)?.verified)));
      })
    );
  }

  verifyReview(id: string): Observable<Review> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, { verified: true }).pipe(
      map(res => this.unwrap<Review>(res))
    );
  }
}
