import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { Crypto, CryptoDetailResponse } from '../models/crypto.model';
import { CacheService } from './cache.service';

@Injectable({ providedIn: 'root' })
export class PriceService {
  private apiUrl = 'https://api.coingecko.com/api/v3/coins/markets';
  private detailUrl = 'https://api.coingecko.com/api/v3/coins';

  // Cache TTL in minutes
  private readonly LIST_CACHE_TTL = 2; // 2 minutes for lists
  private readonly DETAIL_CACHE_TTL = 5; // 5 minutes for details
  private readonly CHART_CACHE_TTL = 5; // 5 minutes for charts

  constructor(private http: HttpClient, private cacheService: CacheService) {}

  getTopCryptos(vsCurrency: string = 'usd'): Observable<Crypto[]> {
    const cacheKey = `coins_list_top_${vsCurrency}`;
    const cached = this.cacheService.get<Crypto[]>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http
      .get<Crypto[]>(
        `${this.apiUrl}?vs_currency=${vsCurrency}&order=market_cap_desc&per_page=10&page=1`
      )
      .pipe(
        tap((data) => this.cacheService.set(cacheKey, data, this.LIST_CACHE_TTL)),
        shareReplay(1)
      );
  }

  getCryptoDetail(id: string, vsCurrency: string = 'usd'): Observable<Crypto> {
    const cacheKey = `coin_detail_${id}_${vsCurrency}`;
    const cached = this.cacheService.get<Crypto>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http
      .get<CryptoDetailResponse>(
        `${this.detailUrl}/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
      )
      .pipe(
        map((response) => ({
          id: response.id,
          symbol: response.symbol,
          name: response.name,
          image: response.image.large,
          current_price: response.market_data.current_price[vsCurrency],
          price_change_percentage_24h: response.market_data.price_change_percentage_24h,
          market_cap_rank: response.market_data.market_cap_rank,
          market_cap: response.market_data.market_cap[vsCurrency],
          total_volume: response.market_data.total_volume[vsCurrency],
          high_24h: response.market_data.high_24h[vsCurrency],
          low_24h: response.market_data.low_24h[vsCurrency],
          circulating_supply: response.market_data.circulating_supply,
          ath: response.market_data.ath[vsCurrency],
          atl: response.market_data.atl[vsCurrency],
        })),
        tap((data) => this.cacheService.set(cacheKey, data, this.DETAIL_CACHE_TTL)),
        shareReplay(1)
      );
  }

  getHistoricalData(id: string, days: string, vsCurrency: string = 'usd'): Observable<any> {
    const cacheKey = `chart_${id}_${vsCurrency}_${days}`;
    const cached = this.cacheService.get<any>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http
      .get(`${this.detailUrl}/${id}/market_chart?vs_currency=${vsCurrency}&days=${days}`)
      .pipe(
        tap((data) => this.cacheService.set(cacheKey, data, this.CHART_CACHE_TTL)),
        shareReplay(1)
      );
  }

  getCoinsByIds(ids: string[], vsCurrency: string = 'usd'): Observable<Crypto[]> {
    const cacheKey = `coins_list_${vsCurrency}_${ids.join(',')}`;
    const cached = this.cacheService.get<Crypto[]>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http
      .get<Crypto[]>(
        `${this.apiUrl}?vs_currency=${vsCurrency}&ids=${ids.join(
          ','
        )}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
      )
      .pipe(
        tap((data) => this.cacheService.set(cacheKey, data, this.LIST_CACHE_TTL)),
        shareReplay(1)
      );
  }
}
