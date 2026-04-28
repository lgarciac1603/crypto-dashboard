import { isDevMode } from '@angular/core';

// Get API base URL from environment or use defaults
function getApiBaseUrl(): string {
  // In development (ng serve), use proxy paths to avoid CORS
  if (isDevMode()) {
    return '/api-backend';
  }

  // Check for environment variable injected at runtime
  if (typeof (window as any).__API_BASE_URL__ !== 'undefined') {
    return (window as any).__API_BASE_URL__;
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  return `${protocol}//${hostname}:8080`;
}

// Get Favorites API URL from environment or use defaults
function getFavoritesApiUrl(): string {
  // In development (ng serve), use proxy paths to avoid CORS
  if (isDevMode()) {
    return '/api-favorites';
  }

  // Check for environment variable injected at runtime
  if (typeof (window as any).__API_FAVORITES_URL__ !== 'undefined') {
    return (window as any).__API_FAVORITES_URL__;
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  return `${protocol}//${hostname}:8090`;
}

// Cache Proxy API always uses a relative path:
//   - In dev (ng serve): Angular dev proxy forwards /api-cache → localhost:8070
//   - In Docker: nginx proxies /api-cache → cache-proxy-api:8070 (internal)
// This means no CORS issues in either mode and the service is never directly exposed.
function getCacheProxyUrl(): string {
  return '/api-cache';
}

export const API_BASE_URL = getApiBaseUrl();
export const API_FAVORITES_URL = getFavoritesApiUrl();
export const API_CACHE_URL = getCacheProxyUrl();
