import { Crypto } from '../../core/models/crypto.model';

export interface CachedData<T> {
  data: T;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

export interface CryptoListState {
  [currency: string]: CachedData<Crypto[]>;
}

export interface CryptoDetailState {
  [key: string]: CachedData<Crypto>; // key format: `${id}_${currency}`
}

export interface ChartDataState {
  [key: string]: CachedData<any>; // key format: `${id}_${currency}_${days}`
}

export interface CryptoState {
  cryptoList: CryptoListState;
  cryptoDetails: CryptoDetailState;
  chartData: ChartDataState;
  selectedCurrency: string;
}

export const initialCryptoState: CryptoState = {
  cryptoList: {},
  cryptoDetails: {},
  chartData: {},
  selectedCurrency: 'usd',
};

// Cache TTL in milliseconds
export const CACHE_TTL = {
  LIST: 2 * 60 * 1000, // 2 minutes
  DETAIL: 5 * 60 * 1000, // 5 minutes
  CHART: 5 * 60 * 1000, // 5 minutes
};

// Helper to check if cache is valid
export function isCacheValid(lastUpdated: number, ttl: number): boolean {
  return Date.now() - lastUpdated < ttl;
}
