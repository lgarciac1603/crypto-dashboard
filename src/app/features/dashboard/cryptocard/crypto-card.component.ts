import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Crypto } from '../../../core/models/crypto.model';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { NumberSignPipe } from '../../../shared/pipes/number-sign.pipe';

@Component({
  selector: 'app-crypto-card',
  standalone: true,
  imports: [CommonModule, NumberSignPipe],
  templateUrl: './crypto-card.component.html',
  styleUrls: ['./crypto-card.component.scss'],
})
export class CryptoCardComponent {
  @Input() crypto!: Crypto;
  @Input() isFavorite = false;
  @Input() favoritesService: FavoritesService | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  navigateToDetail(): void {
    this.router.navigate(['/crypto', this.crypto.id]);
  }

  toggleFavorite(event: Event): void {
    event.stopPropagation();
    if (!this.favoritesService) return;

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/'], {
        queryParams: { login: '1', redirectTo: this.router.url },
        queryParamsHandling: 'merge',
      });
      return;
    }

    this.favoritesService.toggleFavorite(this.crypto.id, this.crypto.name).subscribe();
  }
}
