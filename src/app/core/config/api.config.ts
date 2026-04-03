// Get API base URL from environment or use defaults
function getApiBaseUrl(): string {
  // Check for environment variable
  if (typeof (window as any).__API_BASE_URL__ !== 'undefined') {
    return (window as any).__API_BASE_URL__;
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  // Development environments
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8080';
  }

  // Docker/Production - same host, different ports
  return `${protocol}//${hostname}:8080`;
}

// Get Favorites API URL from environment or use defaults
function getFavoritesApiUrl(): string {
  // Check for environment variable
  if (typeof (window as any).__API_FAVORITES_URL__ !== 'undefined') {
    return (window as any).__API_FAVORITES_URL__;
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  // Development environments
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8090';
  }

  // Docker/Production - same host, different ports
  return `${protocol}//${hostname}:8090`;
}

export const API_BASE_URL = getApiBaseUrl();
export const API_FAVORITES_URL = getFavoritesApiUrl();
