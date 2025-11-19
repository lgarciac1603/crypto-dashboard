import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CryptoState, CACHE_TTL, isCacheValid } from './crypto.state';

// Feature selector
export const selectCryptoState = createFeatureSelector<CryptoState>('crypto');

// Selected Currency
export const selectSelectedCurrency = createSelector(
  selectCryptoState,
  (state) => state.selectedCurrency
);

// Crypto List Selectors
export const selectCryptoListState = createSelector(selectCryptoState, (state) => state.cryptoList);

export const selectCryptoList = (currency: string) =>
  createSelector(selectCryptoListState, (cryptoList) => {
    const cached = cryptoList[currency];
    if (!cached) return null;

    // Check if cache is valid
    if (!isCacheValid(cached.lastUpdated, CACHE_TTL.LIST)) {
      return null; // Cache expired
    }

    return cached.data;
  });

export const selectCryptoListLoading = (currency: string) =>
  createSelector(selectCryptoListState, (cryptoList) => cryptoList[currency]?.loading || false);

export const selectCryptoListError = (currency: string) =>
  createSelector(selectCryptoListState, (cryptoList) => cryptoList[currency]?.error || null);

// Crypto Detail Selectors
export const selectCryptoDetailsState = createSelector(
  selectCryptoState,
  (state) => state.cryptoDetails
);

export const selectCryptoDetail = (id: string, currency: string) =>
  createSelector(selectCryptoDetailsState, (cryptoDetails) => {
    const key = `${id}_${currency}`;
    const cached = cryptoDetails[key];
    if (!cached) return null;

    // Check if cache is valid
    if (!isCacheValid(cached.lastUpdated, CACHE_TTL.DETAIL)) {
      return null; // Cache expired
    }

    return cached.data;
  });

export const selectCryptoDetailLoading = (id: string, currency: string) =>
  createSelector(selectCryptoDetailsState, (cryptoDetails) => {
    const key = `${id}_${currency}`;
    return cryptoDetails[key]?.loading || false;
  });

export const selectCryptoDetailError = (id: string, currency: string) =>
  createSelector(selectCryptoDetailsState, (cryptoDetails) => {
    const key = `${id}_${currency}`;
    return cryptoDetails[key]?.error || null;
  });

// Chart Data Selectors
export const selectChartDataState = createSelector(selectCryptoState, (state) => state.chartData);

export const selectChartData = (id: string, currency: string, days: string) =>
  createSelector(selectChartDataState, (chartData) => {
    const key = `${id}_${currency}_${days}`;
    const cached = chartData[key];
    if (!cached) return null;

    // Check if cache is valid
    if (!isCacheValid(cached.lastUpdated, CACHE_TTL.CHART)) {
      return null; // Cache expired
    }

    return cached.data;
  });

export const selectChartDataLoading = (id: string, currency: string, days: string) =>
  createSelector(selectChartDataState, (chartData) => {
    const key = `${id}_${currency}_${days}`;
    return chartData[key]?.loading || false;
  });

export const selectChartDataError = (id: string, currency: string, days: string) =>
  createSelector(selectChartDataState, (chartData) => {
    const key = `${id}_${currency}_${days}`;
    return chartData[key]?.error || null;
  });

// Combined selectors
export const selectIsAnyLoading = createSelector(selectCryptoState, (state) => {
  const listLoading = Object.values(state.cryptoList).some((item) => item.loading);
  const detailLoading = Object.values(state.cryptoDetails).some((item) => item.loading);
  const chartLoading = Object.values(state.chartData).some((item) => item.loading);
  return listLoading || detailLoading || chartLoading;
});
