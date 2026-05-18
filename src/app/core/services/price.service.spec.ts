import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PriceService } from './price.service';
import { CacheService } from './cache.service';
import { API_CACHE_URL } from '../config/api.config';
import { createMockCrypto, createMockCryptoList } from '../../../testing/test-utils';
import { CryptoDetailResponse } from '../models/crypto.model';

describe('PriceService', () => {
  let service: PriceService;
  let httpMock: HttpTestingController;
  let cacheService: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PriceService, CacheService],
    });

    service = TestBed.inject(PriceService);
    httpMock = TestBed.inject(HttpTestingController);
    cacheService = TestBed.inject(CacheService);
  });

  afterEach(() => {
    httpMock.verify();
    cacheService.clear();
  });

  function createMockCryptoDetailResponse(
    overrides?: Partial<CryptoDetailResponse>,
  ): CryptoDetailResponse {
    return {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      image: {
        large: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      },
      market_data: {
        current_price: {
          usd: 45000,
          eur: 42000,
        },
        price_change_percentage_24h: 2.5,
        market_cap: {
          usd: 900000000000,
          eur: 840000000000,
        },
        market_cap_rank: 1,
        total_volume: {
          usd: 20000000000,
          eur: 18000000000,
        },
        high_24h: {
          usd: 46000,
          eur: 43000,
        },
        low_24h: {
          usd: 44000,
          eur: 41000,
        },
        circulating_supply: 21000000,
        ath: {
          usd: 69000,
          eur: 64000,
        },
        atl: {
          usd: 67,
          eur: 62,
        },
      },
      ...overrides,
    };
  }

  describe('getTopCryptos', () => {
    it('should fetch top 10 cryptos for given currency', (done) => {
      const mockCryptos = createMockCryptoList(10);
      const vsCurrency = 'usd';

      service.getTopCryptos(vsCurrency).subscribe((cryptos) => {
        expect(cryptos.length).toBe(10);
        expect(cryptos[0].symbol).toBe(mockCryptos[0].symbol);
        done();
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes(`${API_CACHE_URL}/providers/coingecko/coins/markets`) &&
          request.url.includes(`vs_currency=${vsCurrency}`),
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCryptos);
    });

    it('should use default currency (usd) if not provided', (done) => {
      const mockCryptos = createMockCryptoList(10);

      service.getTopCryptos().subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes(`${API_CACHE_URL}/providers/coingecko/coins/markets`) &&
          request.url.includes('vs_currency=usd'),
      );
      req.flush(mockCryptos);
    });

    it('should cache results for 2 minutes', (done) => {
      const mockCryptos = createMockCryptoList(10);
      const vsCurrency = 'eur';
      const cacheGetOrFetchSpy = jest.spyOn(cacheService, 'getOrFetch');

      service.getTopCryptos(vsCurrency).subscribe(() => {
        expect(cacheGetOrFetchSpy).toHaveBeenCalledWith(
          `coins_list_top_${vsCurrency}`,
          2,
          expect.any(Function),
        );
        done();
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes(`${API_CACHE_URL}/providers/coingecko/coins/markets`),
      );
      req.flush(mockCryptos);
    });
  });

  describe('getCryptoDetail', () => {
    it('should fetch crypto detail for given id and currency', (done) => {
      const mockResponse = createMockCryptoDetailResponse({ id: 'bitcoin' });
      const id = 'bitcoin';
      const vsCurrency = 'usd';

      service.getCryptoDetail(id, vsCurrency).subscribe((crypto) => {
        expect(crypto.id).toBe('bitcoin');
        expect(crypto.current_price).toBe(45000);
        done();
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes(`${API_CACHE_URL}/providers/coingecko/coins/${id}`) &&
          request.url.includes(`localization=false`),
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should map response correctly', (done) => {
      const mockResponse = createMockCryptoDetailResponse({
        id: 'bitcoin',
        market_data: {
          current_price: { usd: 45000 },
          price_change_percentage_24h: 2.5,
          market_cap: { usd: 900000000000 },
          market_cap_rank: 1,
          total_volume: { usd: 20000000000 },
          high_24h: { usd: 46000 },
          low_24h: { usd: 44000 },
          circulating_supply: 21000000,
          ath: { usd: 69000 },
          atl: { usd: 67 },
        },
      });

      service.getCryptoDetail('bitcoin', 'usd').subscribe((crypto) => {
        expect(crypto.id).toBe('bitcoin');
        expect(crypto.symbol).toBeDefined();
        expect(crypto.name).toBeDefined();
        done();
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes(`${API_CACHE_URL}/providers/coingecko/coins/bitcoin`),
      );
      req.flush(mockResponse);
    });

    it('should cache results for 5 minutes', (done) => {
      const mockCrypto = createMockCryptoDetailResponse({ id: 'ethereum' });
      const id = 'ethereum';
      const vsCurrency = 'eur';
      const cacheGetOrFetchSpy = jest.spyOn(cacheService, 'getOrFetch');

      service.getCryptoDetail(id, vsCurrency).subscribe(() => {
        expect(cacheGetOrFetchSpy).toHaveBeenCalledWith(
          `coin_detail_${id}_${vsCurrency}`,
          5,
          expect.any(Function),
        );
        done();
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes(`${API_CACHE_URL}/providers/coingecko/coins/${id}`),
      );
      req.flush(mockCrypto);
    });
  });

  describe('getHistoricalData', () => {
    it('should fetch historical market data', (done) => {
      const mockData = {
        prices: [
          [1000000000, 45000],
          [1000086400, 45500],
        ],
        market_caps: [[1000000000, 900000000000]],
        volumes: [[1000000000, 20000000000]],
      };

      service.getHistoricalData('bitcoin', '7', 'usd').subscribe((data) => {
        expect(data.prices).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes(`${API_CACHE_URL}/providers/coingecko/coins/bitcoin/market_chart`) &&
          request.url.includes('days=7'),
      );
      req.flush(mockData);
    });

    it('should cache results for 5 minutes', (done) => {
      const mockData = { prices: [] };
      const id = 'bitcoin';
      const days = '30';
      const vsCurrency = 'usd';
      const cacheGetOrFetchSpy = jest.spyOn(cacheService, 'getOrFetch');

      service.getHistoricalData(id, days, vsCurrency).subscribe(() => {
        expect(cacheGetOrFetchSpy).toHaveBeenCalledWith(
          `chart_${id}_${vsCurrency}_${days}`,
          5,
          expect.any(Function),
        );
        done();
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes(`${API_CACHE_URL}/providers/coingecko/coins/${id}/market_chart`),
      );
      req.flush(mockData);
    });
  });

  describe('getCoinsByIds', () => {
    it('should fetch multiple cryptos by IDs', (done) => {
      const ids = ['bitcoin', 'ethereum'];
      const mockCryptos = createMockCryptoList(2);

      service.getCoinsByIds(ids, 'usd').subscribe((cryptos) => {
        expect(cryptos.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes(`${API_CACHE_URL}/providers/coingecko/coins/markets`) &&
          request.url.includes(`ids=${ids.join(',')}`),
      );
      req.flush(mockCryptos);
    });

    it('should cache with IDs in cache key', (done) => {
      const ids = ['bitcoin', 'ethereum'];
      const mockCryptos = createMockCryptoList(2);
      const cacheGetOrFetchSpy = jest.spyOn(cacheService, 'getOrFetch');

      service.getCoinsByIds(ids, 'usd').subscribe(() => {
        expect(cacheGetOrFetchSpy).toHaveBeenCalledWith(
          `coins_list_usd_${ids.join(',')}`,
          2,
          expect.any(Function),
        );
        done();
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes(`${API_CACHE_URL}/providers/coingecko/coins/markets`),
      );
      req.flush(mockCryptos);
    });

    it('should cache results for 2 minutes', (done) => {
      const ids = ['bitcoin'];
      const mockCryptos = createMockCryptoList(1);
      const cacheGetOrFetchSpy = jest.spyOn(cacheService, 'getOrFetch');

      service.getCoinsByIds(ids).subscribe(() => {
        expect(cacheGetOrFetchSpy).toHaveBeenCalledWith(
          expect.any(String),
          2,
          expect.any(Function),
        );
        done();
      });

      const req = httpMock.expectOne((request) =>
        request.url.includes(`${API_CACHE_URL}/providers/coingecko/coins/markets`),
      );
      req.flush(mockCryptos);
    });
  });
});
