import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FavoritesService } from './favorites.service';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { API_FAVORITES_URL } from '../config/api.config';
import { of } from 'rxjs';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let cacheService: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FavoritesService, AuthService, CacheService],
    });

    service = TestBed.inject(FavoritesService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    cacheService = TestBed.inject(CacheService);
  });

  afterEach(() => {
    httpMock.verify();
    cacheService.clear();
  });

  describe('getFavorites', () => {
    it('should fetch favorites list', (done) => {
      const mockResponse = { data: [{ cryptoId: 'bitcoin' }, { cryptoId: 'ethereum' }] };
      jest.spyOn(authService as any, 'getAccessToken').mockReturnValue('test-token');

      service.getFavorites().subscribe((favorites) => {
        expect(favorites).toEqual(['bitcoin', 'ethereum']);
        done();
      });

      const req = httpMock.expectOne(`${API_FAVORITES_URL}/favorites`);
      req.flush(mockResponse);
    });

    it('should update subject with fetched favorites', (done) => {
      const mockResponse = { data: [{ cryptoId: 'bitcoin' }] };
      jest.spyOn(authService as any, 'getAccessToken').mockReturnValue('test-token');
      const subjectSpy = jest.spyOn((service as any).favoritesSubject, 'next');

      service.getFavorites().subscribe(() => {
        expect(subjectSpy).toHaveBeenCalledWith(['bitcoin']);
        done();
      });

      const req = httpMock.expectOne(`${API_FAVORITES_URL}/favorites`);
      req.flush(mockResponse);
    });

    it('should handle empty favorites', (done) => {
      const mockResponse = { data: [] };
      jest.spyOn(authService as any, 'getAccessToken').mockReturnValue('test-token');

      service.getFavorites().subscribe((favorites) => {
        expect(favorites).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(`${API_FAVORITES_URL}/favorites`);
      req.flush(mockResponse);
    });
  });

  describe('addFavorite', () => {
    it('should add favorite to list', (done) => {
      const initialFavorites = ['bitcoin'];
      (service as any).favoritesSubject.next(initialFavorites);

      service.addFavorite('ethereum', 'Ethereum').subscribe(() => {
        expect((service as any).favoritesSubject.value).toContain('ethereum');
        done();
      });

      const req = httpMock.expectOne(`${API_FAVORITES_URL}/favorites`);
      req.flush(null);
    });

    it('should not add duplicate favorites', (done) => {
      (service as any).favoritesSubject.next(['bitcoin', 'ethereum']);
      const subjectSpy = jest.spyOn((service as any).favoritesSubject, 'next');

      service.addFavorite('bitcoin', 'Bitcoin').subscribe(() => {
        // Should not be called again
        expect(subjectSpy).not.toHaveBeenCalled();
        done();
      });

      const req = httpMock.expectOne(`${API_FAVORITES_URL}/favorites`);
      req.flush(null);
    });

    it('should update cache after adding', (done) => {
      (service as any).favoritesSubject.next(['bitcoin']);
      const cacheSpy = jest.spyOn(cacheService, 'set');

      service.addFavorite('ethereum', 'Ethereum').subscribe(() => {
        expect(cacheSpy).toHaveBeenCalled();
        done();
      });

      const req = httpMock.expectOne(`${API_FAVORITES_URL}/favorites`);
      req.flush(null);
    });
  });

  describe('removeFavorite', () => {
    it('should remove favorite from list', (done) => {
      (service as any).favoritesSubject.next(['bitcoin', 'ethereum']);

      service.removeFavorite('bitcoin').subscribe(() => {
        expect((service as any).favoritesSubject.value).not.toContain('bitcoin');
        expect((service as any).favoritesSubject.value).toContain('ethereum');
        done();
      });

      const req = httpMock.expectOne(`${API_FAVORITES_URL}/favorites/bitcoin`);
      req.flush(null);
    });

    it('should update cache after removing', (done) => {
      (service as any).favoritesSubject.next(['bitcoin', 'ethereum']);
      const cacheSpy = jest.spyOn(cacheService, 'set');

      service.removeFavorite('bitcoin').subscribe(() => {
        expect(cacheSpy).toHaveBeenCalled();
        done();
      });

      const req = httpMock.expectOne(`${API_FAVORITES_URL}/favorites/bitcoin`);
      req.flush(null);
    });
  });

  describe('isFavorite', () => {
    it('should return true if favorite exists', () => {
      (service as any).favoritesSubject.next(['bitcoin', 'ethereum']);
      expect(service.isFavorite('bitcoin')).toBe(true);
    });

    it('should return false if favorite does not exist', () => {
      (service as any).favoritesSubject.next(['bitcoin']);
      expect(service.isFavorite('ethereum')).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('should add favorite if not present', (done) => {
      (service as any).favoritesSubject.next([]);

      service.toggleFavorite('bitcoin', 'Bitcoin').subscribe(() => {
        expect((service as any).favoritesSubject.value).toContain('bitcoin');
        done();
      });

      const req = httpMock.expectOne(`${API_FAVORITES_URL}/favorites`);
      req.flush(null);
    });

    it('should remove favorite if already present', (done) => {
      (service as any).favoritesSubject.next(['bitcoin']);

      service.toggleFavorite('bitcoin', 'Bitcoin').subscribe(() => {
        expect((service as any).favoritesSubject.value).not.toContain('bitcoin');
        done();
      });

      const req = httpMock.expectOne(`${API_FAVORITES_URL}/favorites/bitcoin`);
      req.flush(null);
    });
  });
});
