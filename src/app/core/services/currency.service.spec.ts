import { TestBed } from '@angular/core/testing';
import { CurrencyService } from './currency.service';
import { CacheService } from './cache.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let cacheService: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurrencyService, CacheService],
    });

    service = TestBed.inject(CurrencyService);
    cacheService = TestBed.inject(CacheService);
  });

  afterEach(() => {
    cacheService.clear();
  });

  describe('getSelectedCurrency', () => {
    it('should return default currency (usd)', () => {
      expect(service.getSelectedCurrency()).toBe('usd');
    });

    it('should return current selected currency', () => {
      (service as any).selectedCurrencySubject.next('eur');
      expect(service.getSelectedCurrency()).toBe('eur');
    });
  });

  describe('setSelectedCurrency', () => {
    it('should update selected currency', () => {
      service.setSelectedCurrency('gbp');
      expect(service.getSelectedCurrency()).toBe('gbp');
    });

    it('should clear cache when currency changes', () => {
      cacheService.set('test_key', 'test_data', 5);
      expect(cacheService.has('test_key')).toBe(true);

      service.setSelectedCurrency('eur');

      expect(cacheService.has('test_key')).toBe(false);
    });

    it('should emit new currency value', (done) => {
      service.selectedCurrency$.subscribe((currency) => {
        if (currency === 'jpy') {
          expect(currency).toBe('jpy');
          done();
        }
      });

      service.setSelectedCurrency('jpy');
    });
  });

  describe('getCurrencySymbol', () => {
    it('should return correct symbol for supported currency', () => {
      expect(service.getCurrencySymbol('usd')).toBe('$');
      expect(service.getCurrencySymbol('eur')).toBe('€');
      expect(service.getCurrencySymbol('gbp')).toBe('£');
      expect(service.getCurrencySymbol('jpy')).toBe('¥');
      expect(service.getCurrencySymbol('inr')).toBe('₹');
    });

    it('should return selected currency symbol if code not provided', () => {
      (service as any).selectedCurrencySubject.next('cad');
      expect(service.getCurrencySymbol()).toBe('C$');
    });

    it('should return default symbol for unsupported currency', () => {
      expect(service.getCurrencySymbol('xyz')).toBe('$');
    });

    it('should have all supported currencies', () => {
      expect(service.supportedCurrencies.length).toBeGreaterThan(0);
      expect(service.supportedCurrencies).toContainEqual(expect.objectContaining({ code: 'usd' }));
    });
  });
});
