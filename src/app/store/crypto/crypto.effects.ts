import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators';
import * as CryptoActions from './crypto.actions';
import { PriceService } from '../../core/services/price.service';
import { selectCryptoList, selectCryptoDetail, selectChartData } from './crypto.selectors';

@Injectable()
export class CryptoEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private priceService = inject(PriceService);

  // Load Crypto List Effect
  loadCryptoList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CryptoActions.loadCryptoList),
      withLatestFrom(this.store),
      switchMap(([action, state]) => {
        const { ids, currency } = action;

        // Check cache first
        const cached = selectCryptoList(currency)(state);
        if (cached && cached.length > 0) {
          // Cache hit - don't make API call
          return of(CryptoActions.loadCryptoListSuccess({ data: cached, currency }));
        }

        // Cache miss - make API call
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
      withLatestFrom(this.store),
      switchMap(([action, state]) => {
        const { id, currency } = action;

        // Check cache first
        const cached = selectCryptoDetail(id, currency)(state);
        if (cached) {
          // Cache hit - don't make API call
          return of(CryptoActions.loadCryptoDetailSuccess({ data: cached, id, currency }));
        }

        // Cache miss - make API call
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
      withLatestFrom(this.store),
      switchMap(([action, state]) => {
        const { id, currency, days } = action;

        // Check cache first
        const cached = selectChartData(id, currency, days)(state);
        if (cached) {
          // Cache hit - don't make API call
          return of(CryptoActions.loadChartDataSuccess({ data: cached, id, currency, days }));
        }

        // Cache miss - make API call
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
