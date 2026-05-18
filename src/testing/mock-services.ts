import { of } from 'rxjs';

export class MockCacheService {
  private cache = new Map<string, { data: any; expiresAt: number }>();

  set<T>(key: string, data: T, ttlMinutes: number = 5): void {
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
    this.cache.set(key, { data, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  getOrFetch<T>(
    key: string,
    ttlMinutes: number,
    fetcher: () => any
  ): any {
    const cached = this.get<T>(key);
    if (cached) return of(cached);
    return fetcher().pipe(
      // Simplified: just cache after fetching
    );
  }

  clear(): void {
    this.cache.clear();
  }

  clearByPrefix(prefix: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  getStats(): { keys: number; entries: number } {
    return {
      keys: this.cache.size,
      entries: this.cache.size,
    };
  }
}

export class MockAuthService {
  currentUserSubject = {
    value: null,
    next: jest.fn(),
    asObservable: () => of(null),
  };

  login = jest.fn().mockReturnValue(of({ token: 'mock-token' }));
  logout = jest.fn().mockReturnValue(of(void 0));
  register = jest.fn().mockReturnValue(of({ id: '1' }));
  validateSession = jest.fn().mockReturnValue(of(true));
  getMe = jest.fn().mockReturnValue(of({ id: '1', email: 'test@test.com' }));
  getCurrentUser = jest.fn().mockReturnValue(null);
  refreshAccessToken = jest.fn().mockReturnValue(of({ token: 'new-token' }));
  getAccessToken = jest.fn().mockReturnValue('mock-token');
  isLoggedIn = jest.fn().mockReturnValue(false);
  initSession = jest.fn().mockReturnValue(of(void 0));
}

export class MockPriceService {
  getTopCryptos = jest.fn().mockReturnValue(of([]));
  getCryptoDetail = jest.fn().mockReturnValue(of(null));
  getHistoricalData = jest.fn().mockReturnValue(of([]));
  getCoinsByIds = jest.fn().mockReturnValue(of([]));
}

export class MockFavoritesService {
  favoritesSubject = {
    value: [],
    next: jest.fn(),
    asObservable: () => of([]),
  };

  getFavorites = jest.fn().mockReturnValue(of([]));
  addFavorite = jest.fn().mockReturnValue(of(void 0));
  removeFavorite = jest.fn().mockReturnValue(of(void 0));
  isFavorite = jest.fn().mockReturnValue(false);
  toggleFavorite = jest.fn().mockReturnValue(of(void 0));
}

export class MockCurrencyService {
  selectedCurrencySubject = {
    value: 'usd',
    next: jest.fn(),
    asObservable: () => of('usd'),
  };

  getSelectedCurrency = jest.fn().mockReturnValue('usd');
  setSelectedCurrency = jest.fn();
  getCurrencySymbol = jest.fn().mockReturnValue('$');
}

export class MockRouter {
  navigate = jest.fn().mockResolvedValue(true);
  navigateByUrl = jest.fn().mockResolvedValue(true);
}

export class MockActivatedRoute {
  params = of({ id: 'bitcoin' });
  snapshot = {
    params: { id: 'bitcoin' },
  };
}

export function createMockStore(initialState = {}) {
  return {
    select: jest.fn().mockReturnValue(of(initialState)),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  };
}
