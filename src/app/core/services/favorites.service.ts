import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { API_FAVORITES_URL } from '../config/api.config';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly favoritesCachePrefix = 'favorites_';
  private readonly favoritesCacheTtl = 2;
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cacheService: CacheService,
    private authService: AuthService,
  ) {}

  getFavorites(): Observable<string[]> {
    return this.cacheService
      .getOrFetch(this.favoritesCacheKey(), this.favoritesCacheTtl, () =>
        this.http.get<{ data: Array<{ cryptoId: string }> }>(`${API_FAVORITES_URL}/favorites`).pipe(
          map((response) => response.data?.map((f) => f.cryptoId) ?? []),
          tap((ids) => this.favoritesSubject.next(ids)),
        )
      )
      .pipe(
        catchError(() => {
          this.favoritesSubject.next([]);
          return of([]);
        }),
      );
  }

  addFavorite(cryptoId: string, cryptoName: string): Observable<void> {
    const body = new HttpParams().set('crypto_id', cryptoId).set('crypto_name', cryptoName);

    return this.http
      .post<void>(`${API_FAVORITES_URL}/favorites`, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        tap(() => {
          const current = this.favoritesSubject.value;
          if (!current.includes(cryptoId)) {
            const updated = [...current, cryptoId];
            this.favoritesSubject.next(updated);
            this.cacheService.set(this.favoritesCacheKey(), updated, this.favoritesCacheTtl);
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
        const updated = current.filter((id) => id !== cryptoId);
        this.favoritesSubject.next(updated);
        this.cacheService.set(this.favoritesCacheKey(), updated, this.favoritesCacheTtl);
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

  toggleFavorite(cryptoId: string, cryptoName: string): Observable<void> {
    if (this.isFavorite(cryptoId)) {
      return this.removeFavorite(cryptoId);
    }
    return this.addFavorite(cryptoId, cryptoName);
  }

  private favoritesCacheKey(): string {
    const token = this.authService.getAccessToken();
    const suffix = token ? token.slice(-16) : 'anonymous';
    return `${this.favoritesCachePrefix}list_${suffix}`;
  }
}
