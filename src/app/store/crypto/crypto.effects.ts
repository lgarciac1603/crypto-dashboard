import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as CryptoActions from './crypto.actions';
import { PriceService } from '../../core/services/price.service';

@Injectable()
export class CryptoEffects {
  private actions$ = inject(Actions);
  private priceService = inject(PriceService);

  // Load Crypto List Effect
  loadCryptoList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CryptoActions.loadCryptoList),
      switchMap((action) => {
        const { ids, currency } = action;

        // Always make API call to ensure fresh data for currency changes
        return this.priceService.getCoinsByIds(ids, currency).pipe(
          map((data) => CryptoActions.loadCryptoListSuccess({ data, currency })),
          catchError((error) =>
            of(CryptoActions.loadCryptoListFailure({ error: error.message, currency }))
          )
        );
      })
    )
  );

  // Load Crypto Detail Effect
  loadCryptoDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CryptoActions.loadCryptoDetail),
      switchMap((action) => {
        const { id, currency } = action;

        // Always make API call to ensure fresh data for currency changes
        return this.priceService.getCryptoDetail(id, currency).pipe(
          map((data) => CryptoActions.loadCryptoDetailSuccess({ data, id, currency })),
          catchError((error) =>
            of(CryptoActions.loadCryptoDetailFailure({ error: error.message, id, currency }))
          )
        );
      })
    )
  );

  // Load Chart Data Effect
  loadChartData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CryptoActions.loadChartData),
      switchMap((action) => {
        const { id, currency, days } = action;

        // Always make API call to ensure fresh data for currency changes
        return this.priceService.getHistoricalData(id, days, currency).pipe(
          map((data) => CryptoActions.loadChartDataSuccess({ data, id, currency, days })),
          catchError((error) =>
            of(
              CryptoActions.loadChartDataFailure({
                error: error.message,
                id,
                currency,
                days,
              })
            )
          )
        );
      })
    )
  );

  // Clear cache when currency changes
  currencyChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CryptoActions.setSelectedCurrency),
      map(() => CryptoActions.clearCache())
    )
  );
}
