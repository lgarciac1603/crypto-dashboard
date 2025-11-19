import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CacheService } from './cache.service';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private selectedCurrencySubject = new BehaviorSubject<string>('usd');
  public selectedCurrency$: Observable<string> = this.selectedCurrencySubject.asObservable();

  supportedCurrencies: Currency[] = [
    { code: 'usd', name: 'US Dollar', symbol: '$' },
    { code: 'eur', name: 'Euro', symbol: '€' },
    { code: 'gbp', name: 'British Pound', symbol: '£' },
    { code: 'jpy', name: 'Japanese Yen', symbol: '¥' },
    { code: 'cad', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'aud', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'chf', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'cny', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'inr', name: 'Indian Rupee', symbol: '₹' },
    { code: 'mxn', name: 'Mexican Peso', symbol: 'MX$' },
  ];

  constructor(private cacheService: CacheService) {}

  getSelectedCurrency(): string {
    return this.selectedCurrencySubject.value;
  }

  setSelectedCurrency(currency: string): void {
    // Clear cache when currency changes to fetch fresh data
    this.cacheService.clear();
    this.selectedCurrencySubject.next(currency);
  }

  getCurrencySymbol(currencyCode?: string): string {
    const code = currencyCode || this.getSelectedCurrency();
    const currency = this.supportedCurrencies.find((c) => c.code === code);
    return currency?.symbol || '$';
  }
}
