import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { API_FAVORITES_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getFavorites(): Observable<string[]> {
    return this.http.get<string[]>(`${API_FAVORITES_URL}/favorites`).pipe(
      tap((ids) => this.favoritesSubject.next(ids)),
      catchError(() => {
        this.favoritesSubject.next([]);
        return of([]);
      }),
    );
  }

  addFavorite(cryptoId: string): Observable<void> {
    const body = new HttpParams().set('crypto_id', cryptoId);

    return this.http
      .post<void>(`${API_FAVORITES_URL}/favorites`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        tap(() => {
          const current = this.favoritesSubject.value;
          if (!current.includes(cryptoId)) {
            this.favoritesSubject.next([...current, cryptoId]);
          }
        }),
        catchError((error) => {
          console.error('Error adding favorite:', error);
          return of(void 0);
        }),
      );
  }

  removeFavorite(cryptoId: string): Observable<void> {
    return this.http.delete<void>(`${API_FAVORITES_URL}/favorites/${cryptoId}`).pipe(
      tap(() => {
        const current = this.favoritesSubject.value;
        this.favoritesSubject.next(current.filter((id) => id !== cryptoId));
      }),
      catchError((error) => {
        console.error('Error removing favorite:', error);
        return of(void 0);
      }),
    );
  }

  isFavorite(cryptoId: string): boolean {
    return this.favoritesSubject.value.includes(cryptoId);
  }

  toggleFavorite(cryptoId: string): Observable<void> {
    if (this.isFavorite(cryptoId)) {
      return this.removeFavorite(cryptoId);
    }
    return this.addFavorite(cryptoId);
  }
}
