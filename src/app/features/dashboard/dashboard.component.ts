import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceService } from '../../core/services/price.service';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { Crypto } from '../../core/models/crypto.model';
import { CryptoCardComponent } from './cryptocard/crypto-card.component';
import { Store } from '@ngrx/store';
import { selectSelectedCurrency } from '../../store/crypto/crypto.selectors';
import { Subject, takeUntil, switchMap } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CryptoCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  cryptos: Crypto[] = [];
  favoriteCryptos: Crypto[] = [];
  isLoggedIn = false;
  private destroy$ = new Subject<void>();

  constructor(
    private priceService: PriceService,
    private authService: AuthService,
    public favoritesService: FavoritesService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();

    if (this.isLoggedIn) {
      this.favoritesService.getFavorites().subscribe();
    }

    // Subscribe to selected currency and reload data when it changes
    this.store
      .select(selectSelectedCurrency)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((currency) => {
          this.loadCryptos(currency);
          return this.priceService.getTopCryptos(currency);
        }),
      )
      .subscribe((data) => {
        this.cryptos = data;
        this.updateFavoriteCryptos(data);
      });

    this.favoritesService.favorites$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateFavoriteCryptos(this.cryptos);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCryptos(currency: string): void {
    this.priceService.getTopCryptos(currency).subscribe((data) => (this.cryptos = data));
  }

  private updateFavoriteCryptos(allCryptos: Crypto[]): void {
    const favoriteIds = this.favoritesService['favoritesSubject'].value;
    this.favoriteCryptos = allCryptos.filter((c) => favoriteIds.includes(c.id));
  }
}
