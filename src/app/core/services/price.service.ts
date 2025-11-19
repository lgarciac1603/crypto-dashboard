import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Crypto, CryptoDetailResponse } from '../models/crypto.model';

@Injectable({ providedIn: 'root' })
export class PriceService {
  private apiUrl = 'https://api.coingecko.com/api/v3/coins/markets';
  private detailUrl = 'https://api.coingecko.com/api/v3/coins';
  private params = '?vs_currency=usd&order=market_cap_desc&per_page=10&page=1';

  constructor(private http: HttpClient) {}

  getTopCryptos(): Observable<Crypto[]> {
    return this.http.get<Crypto[]>(`${this.apiUrl}${this.params}`);
  }

  getCryptoDetail(id: string): Observable<Crypto> {
    return this.http.get<CryptoDetailResponse>(
      `${this.detailUrl}/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    ).pipe(
      map(response => ({
        id: response.id,
        symbol: response.symbol,
        name: response.name,
        image: response.image.large,
        current_price: response.market_data.current_price.usd,
        price_change_percentage_24h: response.market_data.price_change_percentage_24h,
        market_cap_rank: response.market_data.market_cap_rank,
        market_cap: response.market_data.market_cap.usd,
        total_volume: response.market_data.total_volume.usd,
        high_24h: response.market_data.high_24h.usd,
        low_24h: response.market_data.low_24h.usd,
        circulating_supply: response.market_data.circulating_supply,
        ath: response.market_data.ath.usd,
        atl: response.market_data.atl.usd
      }))
    );
  }
}
