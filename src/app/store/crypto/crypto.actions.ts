import { createAction, props } from '@ngrx/store';
import { Crypto } from '../../core/models/crypto.model';

// Crypto List Actions
export const loadCryptoList = createAction(
  '[Crypto] Load Crypto List',
  props<{ ids: string[]; currency: string }>()
);

export const loadCryptoListSuccess = createAction(
  '[Crypto] Load Crypto List Success',
  props<{ data: Crypto[]; currency: string }>()
);

export const loadCryptoListFailure = createAction(
  '[Crypto] Load Crypto List Failure',
  props<{ error: string; currency: string }>()
);

// Crypto Detail Actions
export const loadCryptoDetail = createAction(
  '[Crypto] Load Crypto Detail',
  props<{ id: string; currency: string }>()
);

export const loadCryptoDetailSuccess = createAction(
  '[Crypto] Load Crypto Detail Success',
  props<{ data: Crypto; id: string; currency: string }>()
);

export const loadCryptoDetailFailure = createAction(
  '[Crypto] Load Crypto Detail Failure',
  props<{ error: string; id: string; currency: string }>()
);

// Chart Data Actions
export const loadChartData = createAction(
  '[Crypto] Load Chart Data',
  props<{ id: string; currency: string; days: string }>()
);

export const loadChartDataSuccess = createAction(
  '[Crypto] Load Chart Data Success',
  props<{ data: any; id: string; currency: string; days: string }>()
);

export const loadChartDataFailure = createAction(
  '[Crypto] Load Chart Data Failure',
  props<{ error: string; id: string; currency: string; days: string }>()
);

// Currency Actions
export const setSelectedCurrency = createAction(
  '[Crypto] Set Selected Currency',
  props<{ currency: string }>()
);

// Cache Actions
export const clearCache = createAction('[Crypto] Clear Cache');

export const clearCacheByPrefix = createAction(
  '[Crypto] Clear Cache By Prefix',
  props<{ prefix: string }>()
);
