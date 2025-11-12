import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceService } from '../../core/services/price.service';
import { Crypto } from '../../core/models/crypto.model';
import { CryptoCardComponent } from './cryptocard/crypto-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CryptoCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  cryptos: Crypto[] = [];

  constructor(private priceService: PriceService) {}

  ngOnInit(): void {
    this.priceService.getTopCryptos().subscribe((data) => (this.cryptos = data));
  }
}
