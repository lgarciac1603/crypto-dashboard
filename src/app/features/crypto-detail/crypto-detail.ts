import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subject, takeUntil } from 'rxjs';
import { PriceService } from '../../core/services/price.service';
import { CurrencyService } from '../../core/services/currency.service';
import { Crypto } from '../../core/models/crypto.model';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

type TimePeriod = '1h' | '24h' | '7d' | '30d' | '1y';

@Component({
  selector: 'app-crypto-detail',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './crypto-detail.html',
  styleUrl: './crypto-detail.scss',
})
export class CryptoDetail implements OnInit, OnDestroy {
  crypto: Crypto | null = null;
  selectedPeriod: TimePeriod = '24h';
  isLoading = true;
  lastUpdate: Date = new Date();
  private destroy$ = new Subject<void>();

  chartOption: EChartsOption = {};

  periods: { label: string; value: TimePeriod }[] = [
    { label: 'Current', value: '1h' },
    { label: 'Week', value: '7d' },
    { label: 'Month', value: '30d' },
    { label: 'Year', value: '1y' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private priceService: PriceService,
    public currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameter changes
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const cryptoId = params.get('id') || 'bitcoin';
      this.loadCryptoData(cryptoId);
      this.loadChartData(cryptoId, '1'); // Load initial chart
    });

    // Auto-refresh disabled - cache handles data freshness
    // Uncomment below if you want periodic refresh (not recommended with cache)
    /*
    interval(120000) // 2 minutes
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const cryptoId = this.route.snapshot.paramMap.get('id') || 'bitcoin';
        this.loadCryptoData(cryptoId);
      });
    */

    // Subscribe to currency changes - cache is cleared automatically
    this.currencyService.selectedCurrency$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const cryptoId = this.route.snapshot.paramMap.get('id') || 'bitcoin';
      this.loadCryptoData(cryptoId);
      // Reload chart with current period
      const days = this.getDaysForPeriod(this.selectedPeriod);
      this.loadChartData(cryptoId, days);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCryptoData(id: string): void {
    const currency = this.currencyService.getSelectedCurrency();
    this.priceService.getCryptoDetail(id, currency).subscribe({
      next: (data) => {
        this.crypto = data;
        this.isLoading = false;
        this.lastUpdate = new Date();
      },
      error: (err) => {
        console.error('Error loading crypto:', err);
        this.isLoading = false;
      },
    });
  }

  selectPeriod(period: TimePeriod): void {
    this.selectedPeriod = period;
    const cryptoId = this.route.snapshot.paramMap.get('id') || 'bitcoin';
    const days = this.getDaysForPeriod(period);
    this.loadChartData(cryptoId, days);
  }

  getDaysForPeriod(period: TimePeriod): string {
    switch (period) {
      case '1h':
      case '24h':
        return '1';
      case '7d':
        return '7';
      case '30d':
        return '30';
      case '1y':
        return '365';
      default:
        return '1';
    }
  }

  loadChartData(id: string, days: string): void {
    const currency = this.currencyService.getSelectedCurrency();
    this.priceService.getHistoricalData(id, days, currency).subscribe({
      next: (data) => {
        this.updateChart(data.prices);
      },
      error: (err) => {
        console.error('Error loading chart data:', err);
      },
    });
  }

  updateChart(prices: [number, number][]): void {
    const data = prices.map((item) => ({
      name: new Date(item[0]).toString(),
      value: [new Date(item[0]).toISOString(), item[1]],
    }));

    this.chartOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
        },
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        borderColor: '#D4AF37',
        textStyle: {
          color: '#ffffff',
        },
        formatter: (params: any) => {
          const date = new Date(params[0].value[0]);
          const price = params[0].value[1];
          const symbol = this.currencyService.getCurrencySymbol();
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}<br/>Price: ${symbol}${price.toFixed(
            2
          )}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#4B5563',
          },
        },
        axisLabel: {
          color: '#9CA3AF',
          formatter: (value: any) => {
            const date = new Date(value);
            return this.selectedPeriod === '1h' || this.selectedPeriod === '24h'
              ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : date.toLocaleDateString();
          },
        },
      },
      yAxis: {
        type: 'value',
        scale: true,
        splitLine: {
          lineStyle: {
            color: '#374151',
          },
        },
        axisLabel: {
          color: '#9CA3AF',
          formatter: (value: any) => {
            const symbol = this.currencyService.getCurrencySymbol();
            return `${symbol}${value.toLocaleString()}`;
          },
        },
      },
      series: [
        {
          name: 'Price',
          type: 'line',
          smooth: true,
          symbol: 'none',
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(212, 175, 55, 0.5)', // Gold start
                },
                {
                  offset: 1,
                  color: 'rgba(212, 175, 55, 0)', // Gold end
                },
              ],
              global: false,
            },
          },
          lineStyle: {
            color: '#D4AF37',
            width: 2,
          },
          data: data,
        },
      ],
    } as any;
  }

  getPriceChangeClass(): string {
    if (!this.crypto) return '';
    return this.crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
  }

  formatNumber(num: number): string {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
