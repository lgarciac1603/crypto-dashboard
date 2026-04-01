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
import { AuthService, User } from './core/services/auth.service';
import { LoginModalComponent } from './shared/components/login-modal/login-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, LoginModalComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoggedIn = false;
  userName = '';
  userAvatar = '';
  showLoginModal = false;

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
    public currencyService: CurrencyService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Restore session from persisted tokens if available
    this.authService.initSession().subscribe({
      next: () => this.updateLoginStatus(),
      error: () => this.updateLoginStatus(),
    });

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
        }),
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
      }),
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
    this.showLoginModal = true;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.updateLoginStatus();
    });
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  onLoginSuccess(user: User): void {
    this.updateLoginStatus();
  }

  private updateLoginStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.userName = user.username;
        this.userAvatar = user.avatar;
      }
    } else {
      this.userName = '';
      this.userAvatar = '';
    }
  }

  selectCrypto(crypto: Crypto): void {
    this.router.navigate(['/crypto', crypto.id]);
  }
}
