import { Injectable } from '@angular/core';
import { Observable, finalize, of, shareReplay, tap } from 'rxjs';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private inflightRequests = new Map<string, Observable<any>>();

  /**
   * Store data in cache with TTL (Time To Live)
   * @param key Cache key
   * @param data Data to cache
   * @param ttlMinutes Time to live in minutes
   */
  set<T>(key: string, data: T, ttlMinutes: number): void {
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Get data from cache if not expired
   * @param key Cache key
   * @returns Cached data or null if expired/missing
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Return cached data when available, otherwise execute and memoize the request.
   */
  getOrFetch<T>(key: string, ttlMinutes: number, fetcher: () => Observable<T>): Observable<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return of(cached);
    }

    const inflight = this.inflightRequests.get(key);
    if (inflight) {
      return inflight as Observable<T>;
    }

    const request$ = fetcher().pipe(
      tap((data) => this.set(key, data, ttlMinutes)),
      finalize(() => this.inflightRequests.delete(key)),
      shareReplay(1),
    );

    this.inflightRequests.set(key, request$);
    return request$;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.inflightRequests.clear();
  }

  /**
   * Clear cache entries by key prefix
   * @param prefix Key prefix to match
   */
  clearByPrefix(prefix: string): void {
    const keysToDelete: string[] = [];
    const inflightToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });

    this.inflightRequests.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        inflightToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
    inflightToDelete.forEach((key) => this.inflightRequests.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
