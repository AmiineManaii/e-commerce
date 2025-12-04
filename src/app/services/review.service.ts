import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../Models/review';
import { API_BASE_URL } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = API_BASE_URL + '/reviews';

  constructor(private http: HttpClient) { }

  getReviews(): Observable<Review[]> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Review[]}>(this.apiUrl)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  getReviewById(id: string): Observable<Review> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Review}>(`${this.apiUrl}/${id}`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  getReviewsByGameId(gameId: string): Observable<Review[]> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Review[]}>(`${this.apiUrl}/game/${gameId}`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  getReviewsByUserId(userId: string): Observable<Review[]> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Review[]}>(`${this.apiUrl}/user/${userId}`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  createReview(review: Omit<Review, 'id'>): Observable<Review> {
    return new Observable(observer => {
      this.http.post<{status: string, message: string, data: Review}>(this.apiUrl, review)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    return new Observable(observer => {
      // D'abord récupérer la review existante
      this.getReviewById(id).subscribe({
        next: (existingReview) => {
          // Fusionner les modifications avec la review existante
          const updatedReview = {
            ...existingReview,
            ...review
          };
          
          // Envoyer la mise à jour avec PUT (votre API Spring Boot utilise PUT)
          this.http.put<{status: string, message: string, data: Review}>(`${this.apiUrl}/${id}`, updatedReview)
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

  deleteReview(id: string): Observable<void> {
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

  // Méthodes supplémentaires disponibles dans votre API Spring Boot
  getVerifiedReviews(): Observable<Review[]> {
    return new Observable(observer => {
      this.http.get<{status: string, message: string, data: Review[]}>(`${this.apiUrl}/verified`)
        .subscribe({
          next: (response) => {
            observer.next(response.data);
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
    });
  }

  verifyReview(id: string): Observable<Review> {
    return new Observable(observer => {
      this.http.patch<{status: string, message: string, data: Review}>(`${this.apiUrl}/${id}/verify`, {})
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