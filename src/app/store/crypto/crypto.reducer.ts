import { createReducer, on } from '@ngrx/store';
import * as CryptoActions from './crypto.actions';
import { initialCryptoState, CryptoState } from './crypto.state';

export const cryptoReducer = createReducer(
  initialCryptoState,

  // Crypto List
  on(CryptoActions.loadCryptoList, (state, { currency }) => ({
    ...state,
    cryptoList: {
      ...state.cryptoList,
      [currency]: {
        ...(state.cryptoList[currency] || { data: [], error: null, lastUpdated: 0 }),
        loading: true,
      },
    },
  })),

  on(CryptoActions.loadCryptoListSuccess, (state, { data, currency }) => ({
    ...state,
    cryptoList: {
      ...state.cryptoList,
      [currency]: {
        data,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      },
    },
  })),

  on(CryptoActions.loadCryptoListFailure, (state, { error, currency }) => ({
    ...state,
    cryptoList: {
      ...state.cryptoList,
      [currency]: {
        ...(state.cryptoList[currency] || { data: [], lastUpdated: 0 }),
        loading: false,
        error,
      },
    },
  })),

  // Crypto Detail
  on(CryptoActions.loadCryptoDetail, (state, { id, currency }) => {
    const key = `${id}_${currency}`;
    return {
      ...state,
      cryptoDetails: {
        ...state.cryptoDetails,
        [key]: {
          ...(state.cryptoDetails[key] || { data: null as any, error: null, lastUpdated: 0 }),
          loading: true,
        },
      },
    };
  }),

  on(CryptoActions.loadCryptoDetailSuccess, (state, { data, id, currency }) => {
    const key = `${id}_${currency}`;
    return {
      ...state,
      cryptoDetails: {
        ...state.cryptoDetails,
        [key]: {
          data,
          loading: false,
          error: null,
          lastUpdated: Date.now(),
        },
      },
    };
  }),

  on(CryptoActions.loadCryptoDetailFailure, (state, { error, id, currency }) => {
    const key = `${id}_${currency}`;
    return {
      ...state,
      cryptoDetails: {
        ...state.cryptoDetails,
        [key]: {
          ...(state.cryptoDetails[key] || { data: null as any, lastUpdated: 0 }),
          loading: false,
          error,
        },
      },
    };
  }),

  // Chart Data
  on(CryptoActions.loadChartData, (state, { id, currency, days }) => {
    const key = `${id}_${currency}_${days}`;
    return {
      ...state,
      chartData: {
        ...state.chartData,
        [key]: {
          ...(state.chartData[key] || { data: null, error: null, lastUpdated: 0 }),
          loading: true,
        },
      },
    };
  }),

  on(CryptoActions.loadChartDataSuccess, (state, { data, id, currency, days }) => {
    const key = `${id}_${currency}_${days}`;
    return {
      ...state,
      chartData: {
        ...state.chartData,
        [key]: {
          data,
          loading: false,
          error: null,
          lastUpdated: Date.now(),
        },
      },
    };
  }),

  on(CryptoActions.loadChartDataFailure, (state, { error, id, currency, days }) => {
    const key = `${id}_${currency}_${days}`;
    return {
      ...state,
      chartData: {
        ...state.chartData,
        [key]: {
          ...(state.chartData[key] || { data: null, lastUpdated: 0 }),
          loading: false,
          error,
        },
      },
    };
  }),

  // Currency
  on(CryptoActions.setSelectedCurrency, (state, { currency }) => ({
    ...state,
    selectedCurrency: currency,
  })),

  // Cache
  on(CryptoActions.clearCache, (state) => ({
    ...initialCryptoState,
    selectedCurrency: state.selectedCurrency,
  })),

  on(CryptoActions.clearCacheByPrefix, (state, { prefix }) => {
    // Clear crypto details or chart data by prefix
    const newCryptoDetails = { ...state.cryptoDetails };
    const newChartData = { ...state.chartData };

    Object.keys(newCryptoDetails).forEach((key) => {
      if (key.startsWith(prefix)) {
        delete newCryptoDetails[key];
      }
    });

    Object.keys(newChartData).forEach((key) => {
      if (key.startsWith(prefix)) {
        delete newChartData[key];
      }
    });

    return {
      ...state,
      cryptoDetails: newCryptoDetails,
      chartData: newChartData,
    };
  })
);
