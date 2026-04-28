import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { API_BASE_URL } from '../config/api.config';
import { CacheService } from './cache.service';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
}

interface SessionResponse {
  access_token: string;
  refresh_token?: string;
}

interface MeResponse {
  id: string | number;
  username: string;
  email: string;
  avatar?: string;
}

interface ValidateSessionResponse {
  valid: boolean;
  user?: MeResponse;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly accessTokenKey = 'accessToken';
  private readonly refreshTokenKey = 'refreshToken';
  private readonly authCachePrefix = 'auth_';
  private readonly meCacheTtl = 5;
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(
    private http: HttpClient,
    private cacheService: CacheService,
  ) {}

  login(credentials: { usernameOrEmail: string; password: string }): Observable<LoginResponse> {
    const body = new HttpParams()
      .set('email', credentials.usernameOrEmail)
      .set('password', credentials.password);

    return this.http
      .post<SessionResponse>(`${API_BASE_URL}/sessions`, body.toString(), {
        headers: this.formHeaders(),
      })
      .pipe(
        switchMap((session) => {
          this.persistTokens(session.access_token, session.refresh_token);

          return this.getMe().pipe(
            map((user) => ({
              success: true,
              user,
              token: session.access_token,
            })),
          );
        }),
        catchError((error) => {
          const message = error?.error?.message || 'Invalid credentials';
          return of({ success: false, message });
        }),
      );
  }

  register(data: {
    username: string;
    email: string;
    password: string;
  }): Observable<RegisterResponse> {
    const body = new HttpParams()
      .set('username', data.username)
      .set('email', data.email)
      .set('password', data.password);

    return this.http
      .post(`${API_BASE_URL}/users`, body.toString(), {
        headers: this.formHeaders(),
      })
      .pipe(
        map(() => ({
          success: true,
          message: 'User created successfully',
        })),
        catchError((error) => {
          const message = error?.error?.message || 'Could not create user';
          return of({ success: false, message });
        }),
      );
  }

  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.clearSession();
      return of(void 0);
    }

    const body = new HttpParams().set('refresh_token', refreshToken);

    return this.http
      .delete<void>(`${API_BASE_URL}/sessions`, {
        headers: this.formHeaders(),
        body: body.toString(),
      })
      .pipe(
        tap(() => this.clearSession()),
        catchError(() => {
          this.clearSession();
          return of(void 0);
        }),
      );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken() && this.currentUserSubject.value !== null;
  }

  initSession(): Observable<User | null> {
    return this.validateSession();
  }

  validateSession(): Observable<User | null> {
    if (!this.getAccessToken()) {
      this.clearSession();
      return of(null);
    }

    const cachedUser = this.cacheService.get<User>(this.sessionValidationCacheKey());
    if (cachedUser) {
      this.currentUserSubject.next(cachedUser);
      return of(cachedUser);
    }

    return this.http.get<ValidateSessionResponse>(`${API_BASE_URL}/validate-session`).pipe(
      map((response) => {
        if (!response.valid || !response.user) {
          return null;
        }

        return this.mapUser(response.user);
      }),
      tap((user) => {
        if (user) {
          this.cacheService.set(this.sessionValidationCacheKey(), user, this.meCacheTtl);
          this.currentUserSubject.next(user);
          return;
        }

        this.clearSession();
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  getMe(): Observable<User> {
    return this.cacheService.getOrFetch(this.meCacheKey(), this.meCacheTtl, () =>
      this.http.get<MeResponse>(`${API_BASE_URL}/me`).pipe(
        map((response) => this.mapUser(response)),
        tap((user) => this.currentUserSubject.next(user)),
      )
    );
  }

  refreshAccessToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const body = new HttpParams().set('refresh_token', refreshToken);

    return this.http
      .post<SessionResponse>(`${API_BASE_URL}/sessions/refresh`, body.toString(), {
        headers: this.formHeaders(),
      })
      .pipe(
        map((response) => response.access_token),
        tap((accessToken) => this.persistTokens(accessToken)),
      );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private persistTokens(accessToken: string, refreshToken?: string): void {
    this.cacheService.clearByPrefix(this.authCachePrefix);
    this.cacheService.clearByPrefix('favorites_');
    localStorage.setItem(this.accessTokenKey, accessToken);

    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  private clearSession(): void {
    this.cacheService.clearByPrefix(this.authCachePrefix);
    this.cacheService.clearByPrefix('favorites_');
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.currentUserSubject.next(null);
  }

  private meCacheKey(): string {
    return `${this.authCachePrefix}me_${this.sessionCacheSuffix()}`;
  }

  private sessionValidationCacheKey(): string {
    return `${this.authCachePrefix}validate_${this.sessionCacheSuffix()}`;
  }

  private sessionCacheSuffix(): string {
    const token = this.getAccessToken();
    return token ? token.slice(-16) : 'anonymous';
  }

  private mapUser(response: MeResponse): User {
    return {
      id: String(response.id),
      username: response.username,
      email: response.email,
      avatar:
        response.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(response.username)}&background=00f3ff&color=0a0a0f`,
    };
  }

  private formHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
  }
}
