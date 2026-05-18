import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';
import { Observable, of, throwError } from 'rxjs';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheService],
    });
    service = TestBed.inject(CacheService);
  });

  afterEach(() => {
    service.clear();
  });

  describe('set and get', () => {
    it('should store data with TTL', () => {
      const testData = { id: 1, name: 'Test' };
      service.set('test-key', testData, 5);

      const retrieved = service.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = service.get('non-existent');
      expect(result).toBeNull();
    });

    it('should return null for expired keys', () => {
      jest.useFakeTimers();
      const testData = { id: 1, name: 'Test' };
      service.set('test-key', testData, 1); // 1 minute TTL

      jest.advanceTimersByTime(61 * 1000); // Advance 61 seconds

      const result = service.get('test-key');
      expect(result).toBeNull();

      jest.useRealTimers();
    });
  });

  describe('has', () => {
    it('should return true for existing non-expired keys', () => {
      service.set('test-key', { data: 'test' }, 5);
      expect(service.has('test-key')).toBe(true);
    });

    it('should return false for expired keys', () => {
      jest.useFakeTimers();
      service.set('test-key', { data: 'test' }, 1);
      jest.advanceTimersByTime(61 * 1000);

      expect(service.has('test-key')).toBe(false);

      jest.useRealTimers();
    });

    it('should return false for non-existent keys', () => {
      expect(service.has('non-existent')).toBe(false);
    });
  });

  describe('getOrFetch', () => {
    it('should return cached data if available', (done) => {
      const testData = { id: 1, name: 'Test' };
      service.set('test-key', testData, 5);

      const fetcherFn = (): Observable<{ id: number; name: string }> => of({ id: 2, name: 'New' });
      const fetcher = jest.fn(fetcherFn);

      service.getOrFetch('test-key', 5, fetcher).subscribe((result) => {
        expect(result).toEqual(testData);
        expect(fetcher).not.toHaveBeenCalled();
        done();
      });
    });

    it('should fetch and cache data if not in cache', (done) => {
      const newData = { id: 2, name: 'New' };
      const fetcherFn = (): Observable<{ id: number; name: string }> => of(newData);
      const fetcher = jest.fn(fetcherFn);

      service.getOrFetch('test-key', 5, fetcher).subscribe((result) => {
        expect(result).toEqual(newData);
        expect(fetcher).toHaveBeenCalled();
        // Verify data was cached
        expect(service.get('test-key')).toEqual(newData);
        done();
      });
    });

    it('should deduplicate simultaneous requests', () => {
      const fetcherFn = (): Observable<{ id: number; name: string }> => of({ id: 1, name: 'Test' });
      const fetcher = jest.fn(fetcherFn);

      const obs1 = service.getOrFetch('test-key', 5, fetcher);
      const obs2 = service.getOrFetch('test-key', 5, fetcher);

      // Both should be the same observable instance due to shareReplay
      expect(obs1).toBe(obs2);

      // Fetcher should only be called once
      obs1.subscribe();
      obs2.subscribe();

      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should handle fetcher errors gracefully', (done) => {
      const error = new Error('Fetch failed');
      const fetcherFn = (): Observable<never> => throwError(() => error);
      const fetcher = jest.fn(fetcherFn);

      service.getOrFetch('test-key', 5, fetcher).subscribe({
        next: () => {
          done(new Error('Should have thrown'));
        },
        error: (err) => {
          expect(err).toEqual(error);
          done();
        },
      });
    });
  });

  describe('clear', () => {
    it('should clear all cached data', () => {
      service.set('key1', { data: 1 }, 5);
      service.set('key2', { data: 2 }, 5);

      service.clear();

      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBeNull();
    });

    it('should clear inflight requests by forcing a new fetch after clear', (done) => {
      const fetcherFn = (): Observable<{ data: string }> =>
        new Observable((subscriber) => {
          setTimeout(() => {
            subscriber.next({ data: 'test' });
            subscriber.complete();
          }, 100);
        });
      const fetcher = jest.fn(fetcherFn);

      service.getOrFetch('test-key', 5, fetcher).subscribe();

      // Clear the inflight request before it resolves
      service.clear();

      // New request should invoke the fetcher again because previous inflight was cleared
      service.getOrFetch('test-key', 5, fetcher).subscribe((result) => {
        expect(result).toEqual({ data: 'test' });
        expect(fetcher).toHaveBeenCalledTimes(2);
        done();
      });
    });
  });

  describe('clearByPrefix', () => {
    it('should clear only entries with matching prefix', () => {
      service.set('auth_token', 'token123', 5);
      service.set('auth_user', { id: 1 }, 5);
      service.set('favorites_list', [1, 2, 3], 5);

      service.clearByPrefix('auth_');

      expect(service.get('auth_token')).toBeNull();
      expect(service.get('auth_user')).toBeNull();
      expect(service.get('favorites_list')).toEqual([1, 2, 3]);
    });

    it('should handle empty prefix match', () => {
      service.set('key1', 'data1', 5);
      service.set('key2', 'data2', 5);

      service.clearByPrefix('nonexistent_');

      expect(service.get('key1')).toEqual('data1');
      expect(service.get('key2')).toEqual('data2');
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', () => {
      service.set('key1', 'data1', 5);
      service.set('key2', 'data2', 5);
      service.set('key3', 'data3', 5);

      const stats = service.getStats();

      expect(stats.size).toBe(3);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
      expect(stats.keys).toContain('key3');
    });

    it('should exclude expired entries from stats', () => {
      jest.useFakeTimers();

      service.set('key1', 'data1', 1);
      expect(service.getStats().size).toBe(1);

      jest.advanceTimersByTime(61 * 1000);
      // Trigger expiration check by calling get
      service.get('key1');

      expect(service.getStats().size).toBe(0);

      jest.useRealTimers();
    });
  });
});
