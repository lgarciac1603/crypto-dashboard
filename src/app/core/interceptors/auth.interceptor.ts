import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { API_BASE_URL } from '../config/api.config';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const isApiRequest = request.url.startsWith(API_BASE_URL);

  if (!isApiRequest) {
    return next(request);
  }

  const accessToken = authService.getAccessToken();
  const requestWithToken = accessToken
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : request;

  return next(requestWithToken).pipe(
    catchError((error: HttpErrorResponse) => {
      const isUnauthorized = error.status === 401;
      const isRefreshEndpoint = request.url.includes('/sessions/refresh');
      const isLoginEndpoint = request.url.endsWith('/sessions');

      if (!isUnauthorized || isRefreshEndpoint || isLoginEndpoint) {
        return throwError(() => error);
      }

      return authService.refreshAccessToken().pipe(
        switchMap((newAccessToken) =>
          next(
            request.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            }),
          ),
        ),
        catchError((refreshError) => {
          authService.logout().subscribe();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
