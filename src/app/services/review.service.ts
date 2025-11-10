import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../Models/review';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:3000/reviews';

  constructor(private http: HttpClient) { }


  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.apiUrl);
  }

  getReviewById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/${id}`);
  }

  getReviewsByGameId(gameId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}?gameId=${gameId}`);
  }


  getReviewsByUserId(userId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}?userId=${userId}`);
  }


  createReview(review: Omit<Review, 'id'>): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }

 
  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    return this.http.patch<Review>(`${this.apiUrl}/${id}`, review);
  }


  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}