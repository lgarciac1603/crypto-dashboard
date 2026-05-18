import { Crypto } from '@app/core/models/crypto.model';

export function createMockCrypto(overrides?: Partial<Crypto>): Crypto {
  return {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 45000,
    market_cap: 900000000000,
    market_cap_rank: 1,
    total_volume: 20000000000,
    high_24h: 46000,
    low_24h: 44000,
    price_change_24h: 1000,
    price_change_percentage_24h: 2.27,
    market_cap_change_24h: 10000000000,
    market_cap_change_percentage_24h: 1.12,
    circulating_supply: 21000000,
    total_supply: 21000000,
    max_supply: 21000000,
    ath: 69000,
    atl: 67,
    ath_change_percentage: -34.78,
    atl_change_percentage: 67000000,
    ath_date: '2021-11-10T14:24:11.849Z',
    atl_date: '2011-01-14T00:00:00.000Z',
    roi: null,
    last_updated: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockCryptoList(count: number = 5, overrides?: Partial<Crypto>): Crypto[] {
  return Array.from({ length: count }, (_, i) =>
    createMockCrypto({
      id: `crypto-${i}`,
      symbol: `sym${i}`,
      name: `Crypto ${i}`,
      market_cap_rank: i + 1,
      current_price: 1000 + i * 100,
      ...overrides,
    })
  );
}

export interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    token: 'mock-token-12345',
    ...overrides,
  };
}

export type TimePeriod = '1h' | '24h' | '7d' | '30d' | '1y';

export function createMockHistoricalData(
  daysPeriodsMap: Record<TimePeriod, number>
): Record<TimePeriod, Array<[number, number]>> {
  const result: Record<TimePeriod, Array<[number, number]>> = {
    '1h': [],
    '24h': [],
    '7d': [],
    '30d': [],
    '1y': [],
  };

  const now = Date.now();
  const basePrice = 45000;

  Object.entries(daysPeriodsMap).forEach(([period, days]) => {
    result[period as TimePeriod] = Array.from({ length: days }, (_, i) => {
      const timestamp = now - (days - i) * 86400000; // 86400000 ms = 1 day
      const price = basePrice + Math.random() * 5000 - 2500; // ±2500 variance
      return [timestamp, parseFloat(price.toFixed(2))];
    });
  });

  return result;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
