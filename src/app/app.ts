import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Crypto } from './core/models/crypto.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  userName = 'John Doe';
  userAvatar = 'https://ui-avatars.com/api/?name=John+Doe&background=00f3ff&color=0a0a0f';
  favorites: Crypto[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Simulated favorites - in real app would come from service
    this.favorites = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
        current_price: 45000,
        price_change_percentage_24h: 2.5,
        market_cap_rank: 1
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
        current_price: 3200,
        price_change_percentage_24h: -1.2,
        market_cap_rank: 2
      }
    ];
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
