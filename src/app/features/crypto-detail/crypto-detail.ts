import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { interval, Subject, takeUntil } from 'rxjs';
import { PriceService } from '../../core/services/price.service';
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

  constructor(private route: ActivatedRoute, private priceService: PriceService) {}

  ngOnInit(): void {
    const cryptoId = this.route.snapshot.paramMap.get('id') || 'bitcoin';
    this.loadCryptoData(cryptoId);

    // Auto-refresh every 30 seconds
    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadCryptoData(cryptoId);
      });

    this.selectPeriod('24h');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCryptoData(id: string): void {
    this.priceService.getCryptoDetail(id).subscribe({
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

    // Map period to CoinGecko API format
    let days = '1';
    switch (period) {
      case '1h':
        days = '1';
        break;
      case '24h':
        days = '1';
        break;
      case '7d':
        days = '7';
        break;
      case '30d':
        days = '30';
        break;
      case '1y':
        days = '365';
        break;
    }

    this.loadChartData(cryptoId, days);
  }

  loadChartData(id: string, days: string): void {
    this.priceService.getHistoricalData(id, days).subscribe({
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
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}<br/>Price: $${price.toFixed(
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
          formatter: (value: any) => `$${value.toLocaleString()}`,
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
}
