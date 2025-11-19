import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Crypto } from './core/models/crypto.model';
import { PriceService } from './core/services/price.service';
import { CurrencyService } from './core/services/currency.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent implements OnInit {
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
    private priceService: PriceService,
    public currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    this.selectedCurrency = this.currencyService.getSelectedCurrency();
    this.loadCryptoData();

    // Subscribe to currency changes
    this.currencyService.selectedCurrency$.subscribe((currency) => {
      this.selectedCurrency = currency;
      this.loadCryptoData();
    });
  }

  loadCryptoData(): void {
    // Fetch Top Cryptos
    this.priceService.getCoinsByIds(this.cryptoIds, this.selectedCurrency).subscribe({
      next: (data) => {
        console.log('Cryptos loaded:', data.length, data);
        this.cryptos = data;
      },
      error: (err) => {
        console.error('Error loading top cryptos:', err);
      },
    });

    // Fetch Currencies
    this.priceService.getCoinsByIds(this.currencyIds, this.selectedCurrency).subscribe({
      next: (data) => {
        console.log('Currencies loaded:', data.length, data);
        this.currencies = data;
      },
      error: (err) => {
        console.error('Error loading currencies:', err);
      },
    });
  }

  onCurrencyChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.currencyService.setSelectedCurrency(target.value);
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
