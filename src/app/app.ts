import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { Crypto } from './core/models/crypto.model';
import * as CryptoActions from './store/crypto/crypto.actions';
import { selectCryptoList, selectSelectedCurrency } from './store/crypto/crypto.selectors';
import { CurrencyService } from './core/services/currency.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoggedIn = false;
  userName = 'John Doe';
  userAvatar = 'https://ui-avatars.com/api/?name=John+Doe&background=00f3ff&color=0a0a0f';

  // Currency selector
  selectedCurrency = 'usd';

  // Top 5 Cryptos
  cryptoIds = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple'];
  cryptos: Crypto[] = [];

  // Top 5 Currencies (Stablecoins/Proxies)
  currencyIds = ['tether', 'usd-coin', 'euro-coin', 'tether-eurt', 'dai'];
  currencies: Crypto[] = [];

  constructor(
    private router: Router,
    private store: Store,
    public currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    // Subscribe to selected currency and switch to the crypto list for that currency
    this.store
      .select(selectSelectedCurrency)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((currency) => {
          this.selectedCurrency = currency;
          // Load data for new currency
          this.loadCryptoData();
          // Return observable for crypto list
          return this.store.select(selectCryptoList(currency));
        })
      )
      .subscribe((cryptos) => {
        if (cryptos) {
          console.log('Cryptos from store:', cryptos);
          // Filter to get only the requested cryptos
          this.cryptos = cryptos.filter((c) => this.cryptoIds.includes(c.id));
          // Filter to get only the requested currencies
          this.currencies = cryptos.filter((c) => this.currencyIds.includes(c.id));
          console.log('Filtered cryptos:', this.cryptos);
          console.log('Filtered currencies:', this.currencies);
        }
      });

    // Load initial data
    this.loadCryptoData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCryptoData(): void {
    // Dispatch actions to load data into store
    // Combine all IDs into one request
    const allIds = [...this.cryptoIds, ...this.currencyIds];
    this.store.dispatch(
      CryptoActions.loadCryptoList({
        ids: allIds,
        currency: this.selectedCurrency,
      })
    );
  }

  onCurrencyChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newCurrency = target.value;

    // Dispatch action to update currency in store
    this.store.dispatch(CryptoActions.setSelectedCurrency({ currency: newCurrency }));

    // Also update currency service for compatibility
    this.currencyService.setSelectedCurrency(newCurrency);
  }

  getCurrencySymbol(): string {
    return this.currencyService.getCurrencySymbol();
  }

  login(): void {
    this.isLoggedIn = true;
  }

  logout(): void {
    this.isLoggedIn = false;
  }

  selectCrypto(crypto: Crypto): void {
    this.router.navigate(['/crypto', crypto.id]);
  }
}
