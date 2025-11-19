import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Crypto, CryptoDetailResponse } from '../models/crypto.model';

@Injectable({ providedIn: 'root' })
export class PriceService {
  private apiUrl = 'https://api.coingecko.com/api/v3/coins/markets';
  private detailUrl = 'https://api.coingecko.com/api/v3/coins';

  constructor(private http: HttpClient) {}

  getTopCryptos(vsCurrency: string = 'usd'): Observable<Crypto[]> {
    return this.http.get<Crypto[]>(
      `${this.apiUrl}?vs_currency=${vsCurrency}&order=market_cap_desc&per_page=10&page=1`
    );
  }

  getCryptoDetail(id: string, vsCurrency: string = 'usd'): Observable<Crypto> {
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
        }))
      );
  }

  getHistoricalData(id: string, days: string, vsCurrency: string = 'usd'): Observable<any> {
    return this.http.get(
      `${this.detailUrl}/${id}/market_chart?vs_currency=${vsCurrency}&days=${days}`
    );
  }

  getCoinsByIds(ids: string[], vsCurrency: string = 'usd'): Observable<Crypto[]> {
    return this.http.get<Crypto[]>(
      `${this.apiUrl}?vs_currency=${vsCurrency}&ids=${ids.join(
        ','
      )}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
    );
  }
}
