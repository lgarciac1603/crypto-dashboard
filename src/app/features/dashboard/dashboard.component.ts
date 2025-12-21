import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceService } from '../../core/services/price.service';
import { Crypto } from '../../core/models/crypto.model';
import { CryptoCardComponent } from './cryptocard/crypto-card.component';
import { Store } from '@ngrx/store';
import { selectSelectedCurrency } from '../../store/crypto/crypto.selectors';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CryptoCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  cryptos: Crypto[] = [];
  private destroy$ = new Subject<void>();

  constructor(private priceService: PriceService, private store: Store) {}

  ngOnInit(): void {
    // Subscribe to selected currency and reload data when it changes
    this.store
      .select(selectSelectedCurrency)
      .pipe(takeUntil(this.destroy$))
      .subscribe((currency) => {
        this.loadCryptos(currency);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCryptos(currency: string): void {
    this.priceService.getTopCryptos(currency).subscribe((data) => (this.cryptos = data));
  }
}
