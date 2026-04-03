import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.getAccessToken()) {
    return of(
      router.createUrlTree(['/'], {
        queryParams: {
          login: '1',
          redirectTo: state.url,
        },
      }),
    );
  }

  return authService.validateSession().pipe(
    map((user) => {
      if (user) {
        return true;
      }

      return router.createUrlTree(['/'], {
        queryParams: {
          login: '1',
          redirectTo: state.url,
        },
      });
    }),
    catchError(() =>
      of(
        router.createUrlTree(['/'], {
          queryParams: {
            login: '1',
            redirectTo: state.url,
          },
        }),
      ),
    ),
  );
};
