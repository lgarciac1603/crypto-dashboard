import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Crypto } from '../models/crypto.model';

@Injectable({ providedIn: 'root' })
export class PriceService {
  private apiUrl = 'https://api.coingecko.com/api/v3/coins/markets';
  private params = '?vs_currency=usd&order=market_cap_desc&per_page=10&page=1';

  constructor(private http: HttpClient) {}

  getTopCryptos(): Observable<Crypto[]> {
    return this.http.get<Crypto[]>(`${this.apiUrl}${this.params}`);
  }
}
