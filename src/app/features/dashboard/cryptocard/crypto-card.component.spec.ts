import { jest, afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of } from 'rxjs';
import { CryptoCardComponent } from './crypto-card.component';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { Crypto } from '../../../core/models/crypto.model';

describe('CryptoCardComponent', () => {
  let fixture: ComponentFixture<CryptoCardComponent>;
  let component: CryptoCardComponent;
  let router: Router;
  let authService: { isLoggedIn: jest.Mock };

  const mockRouteUrl = '/current';

  const mockCrypto: Crypto = {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://example.com/bitcoin.png',
    current_price: 45000,
    price_change_percentage_24h: 2.5,
    market_cap_rank: 1,
    market_cap: 900000000000,
    total_volume: 20000000000,
    high_24h: 46000,
    low_24h: 44000,
    circulating_supply: 21000000,
    ath: 69000,
    atl: 67,
  };

  beforeEach(async () => {
    authService = {
      isLoggedIn: jest.fn(() => false),
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), CryptoCardComponent],
      providers: [{ provide: AuthService, useValue: authService as unknown as AuthService }],
    }).compileComponents();

    router = TestBed.inject(Router);
    Object.defineProperty(router, 'url', {
      get: () => mockRouteUrl,
      configurable: true,
    });
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    jest.clearAllMocks();

    fixture = TestBed.createComponent(CryptoCardComponent);
    component = fixture.componentInstance;
    component.crypto = mockCrypto;
    component.favoritesService = null;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should navigate to detail page', () => {
    component.navigateToDetail();

    expect(router.navigate).toHaveBeenCalledWith(['/crypto', 'bitcoin']);
  });

  it('should do nothing when favoritesService is not provided', () => {
    component.favoritesService = null;
    component.toggleFavorite(new Event('click'));

    expect(router.navigate).not.toHaveBeenCalledWith(['/'], expect.anything());
  });

  it('should redirect to login when user is not logged in', () => {
    (authService.isLoggedIn as jest.Mock).mockReturnValue(false);
    component.favoritesService = {
      toggleFavorite: jest.fn(() => of(void 0)),
    } as unknown as FavoritesService;

    component.toggleFavorite(new Event('click'));

    expect(router.navigate).toHaveBeenCalledWith(['/'], {
      queryParams: { login: '1', redirectTo: mockRouteUrl },
      queryParamsHandling: 'merge',
    });
  });

  it('should call favoritesService.toggleFavorite when user is logged in', () => {
    const toggleFavoriteSpy = jest.fn<(id: string, name: string) => Observable<void>>(() =>
      of(void 0),
    );

    (authService.isLoggedIn as jest.Mock).mockReturnValue(true);

    component.favoritesService = {
      toggleFavorite: toggleFavoriteSpy,
    } as unknown as FavoritesService;

    component.toggleFavorite(new Event('click'));

    expect(toggleFavoriteSpy).toHaveBeenCalledWith('bitcoin', 'Bitcoin');
  });
});
