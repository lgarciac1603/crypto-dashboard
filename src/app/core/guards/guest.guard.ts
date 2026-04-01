import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return of(router.createUrlTree(['/']));
  }

  if (!authService.getAccessToken()) {
    return of(
      router.createUrlTree(['/'], {
        queryParams: {
          login: '1',
        },
      }),
    );
  }

  return authService.initSession().pipe(
    map((user) => {
      if (user) {
        return router.createUrlTree(['/']);
      }

      return router.createUrlTree(['/'], {
        queryParams: {
          login: '1',
        },
      });
    }),
    catchError(() =>
      of(
        router.createUrlTree(['/'], {
          queryParams: {
            login: '1',
          },
        }),
      ),
    ),
  );
};
