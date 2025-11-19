import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject, takeUntil } from 'rxjs';
import { CacheService } from '../../../core/services/cache.service';
import { CurrencyService } from '../../../core/services/currency.service';

@Component({
  selector: 'app-debug-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './debug-panel.component.html',
  styleUrls: ['./debug-panel.component.scss'],
})
export class DebugPanelComponent implements OnInit, OnDestroy {
  isOpen = false;
  cacheStats: { size: number; keys: string[] } = { size: 0, keys: [] };
  selectedCurrency = '';
  lastUpdate = new Date();
  private destroy$ = new Subject<void>();

  constructor(public cacheService: CacheService, public currencyService: CurrencyService) {}

  ngOnInit(): void {
    // Update stats every 2 seconds
    interval(2000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateStats();
      });

    // Initial update
    this.updateStats();

    // Subscribe to currency changes
    this.currencyService.selectedCurrency$.pipe(takeUntil(this.destroy$)).subscribe((currency) => {
      this.selectedCurrency = currency;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateStats(): void {
    this.cacheStats = this.cacheService.getStats();
    this.selectedCurrency = this.currencyService.getSelectedCurrency();
    this.lastUpdate = new Date();
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  clearCache(): void {
    this.cacheService.clear();
    this.updateStats();
  }

  getCacheKeyType(key: string): string {
    if (key.startsWith('coins_list_')) return '📋 List';
    if (key.startsWith('coin_detail_')) return '💎 Detail';
    if (key.startsWith('chart_')) return '📊 Chart';
    return '❓ Unknown';
  }

  formatKey(key: string): string {
    // Shorten long keys for display
    if (key.length > 40) {
      return key.substring(0, 37) + '...';
    }
    return key;
  }
}
