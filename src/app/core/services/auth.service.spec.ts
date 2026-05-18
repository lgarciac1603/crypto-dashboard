import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { CacheService } from './cache.service';
import { API_BASE_URL } from '../config/api.config';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let cacheService: CacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, CacheService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    cacheService = TestBed.inject(CacheService);
  });

  afterEach(() => {
    httpMock.verify();
    cacheService.clear();
  });

  describe('login', () => {
    it('should successfully login user', (done) => {
      const credentials = { usernameOrEmail: 'test@test.com', password: 'password123' };
      const mockToken = 'mock-access-token';
      const mockUserResponse = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        avatar: '',
      };
      const expectedUser = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        avatar: 'https://ui-avatars.com/api/?name=testuser&background=00f3ff&color=0a0a0f',
      };

      service.login(credentials).subscribe((response) => {
        expect(response.success).toBe(true);
        expect(response.user).toEqual(expectedUser);
        expect(response.token).toBe(mockToken);
        done();
      });

      const loginReq = httpMock.expectOne(`${API_BASE_URL}/sessions`);
      expect(loginReq.request.method).toBe('POST');
      loginReq.flush({
        access_token: mockToken,
        refresh_token: 'refresh-token',
      });

      const meReq = httpMock.expectOne(`${API_BASE_URL}/me`);
      meReq.flush(mockUserResponse);
    });

    it('should handle login failure', (done) => {
      const credentials = { usernameOrEmail: 'test@test.com', password: 'wrong' };

      service.login(credentials).subscribe((response) => {
        expect(response.success).toBe(false);
        expect(response.message).toContain('Invalid');
        done();
      });

      const loginReq = httpMock.expectOne(`${API_BASE_URL}/sessions`);
      loginReq.error(
        new ErrorEvent('Unauthorized', {
          message: 'Invalid credentials',
        }),
        { status: 401 },
      );
    });
  });

  describe('logout', () => {
    it('should clear session on logout', (done) => {
      jest
        .spyOn(service as any, 'getCurrentUser')
        .mockReturnValue({ id: '1', username: 'user', email: 'user@test.com', avatar: '' });
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

      service.logout().subscribe(() => {
        expect(removeItemSpy).toHaveBeenCalledWith('accessToken');
        expect(removeItemSpy).toHaveBeenCalledWith('refreshToken');
        done();
      });

      const deleteReq = httpMock.expectOne(`${API_BASE_URL}/sessions`);
      deleteReq.flush(null);
    });

    it('should clear session even if logout request fails', (done) => {
      localStorage.setItem('refreshToken', 'refresh-token');
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

      service.logout().subscribe(() => {
        expect(removeItemSpy).toHaveBeenCalledWith('accessToken');
        done();
      });

      const deleteReq = httpMock.expectOne(`${API_BASE_URL}/sessions`);
      deleteReq.error(new ErrorEvent('Server error'), { status: 500 });
    });
  });

  describe('validateSession', () => {
    it('should validate active session and cache result', (done) => {
      const mockUserResponse = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        avatar: '',
      };
      const expectedUser = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        avatar: 'https://ui-avatars.com/api/?name=testuser&background=00f3ff&color=0a0a0f',
      };
      jest.spyOn(service as any, 'getAccessToken').mockReturnValue('mock-token');

      service.validateSession().subscribe((user) => {
        expect(user).toEqual(expectedUser);
        // Verify caching
        expect(cacheService.has('auth_validate_mock-token')).toBe(true);
        done();
      });

      const validateReq = httpMock.expectOne(`${API_BASE_URL}/validate-session`);
      validateReq.flush({
        valid: true,
        user: mockUserResponse,
      });
    });

    it('should return null if no token exists', (done) => {
      jest.spyOn(service as any, 'getAccessToken').mockReturnValue(null);

      service.validateSession().subscribe((user) => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should cache validated session', (done) => {
      const mockUserResponse = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        avatar: '',
      };
      jest.spyOn(service as any, 'getAccessToken').mockReturnValue('mock-token');
      const cacheSetSpy = jest.spyOn(cacheService, 'set');

      service.validateSession().subscribe(() => {
        expect(cacheSetSpy).toHaveBeenCalled();
        done();
      });

      const validateReq = httpMock.expectOne(`${API_BASE_URL}/validate-session`);
      validateReq.flush({
        valid: true,
        user: mockUserResponse,
      });
    });
  });

  describe('getMe', () => {
    it('should fetch current user data', (done) => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@test.com' };

      service.getMe().subscribe((user) => {
        expect(user.id).toBe('1');
        expect(user.email).toBe('test@test.com');
        done();
      });

      const meReq = httpMock.expectOne(`${API_BASE_URL}/me`);
      meReq.flush(mockUser);
    });

    it('should cache user data', (done) => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@test.com' };
      const cacheGetOrFetchSpy = jest
        .spyOn(cacheService, 'getOrFetch')
        .mockImplementation((key, ttl, fetcher) => fetcher());

      service.getMe().subscribe(() => {
        expect(cacheGetOrFetchSpy).toHaveBeenCalled();
        done();
      });

      const meReq = httpMock.expectOne(`${API_BASE_URL}/me`);
      meReq.flush(mockUser);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from subject', () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@test.com', avatar: '' };
      // Manually set current user
      (service as any).currentUserSubject.next(mockUser);

      const user = service.getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('should return null if not logged in', () => {
      const user = service.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when user is logged in', () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@test.com', avatar: '' };
      jest.spyOn(service as any, 'getAccessToken').mockReturnValue('mock-token');
      (service as any).currentUserSubject.next(mockUser);

      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false when no token', () => {
      jest.spyOn(service as any, 'getAccessToken').mockReturnValue(null);
      expect(service.isLoggedIn()).toBe(false);
    });

    it('should return false when no user set', () => {
      jest.spyOn(service as any, 'getAccessToken').mockReturnValue('mock-token');
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('initSession', () => {
    it('should initialize session by validating', (done) => {
      const mockUserResponse = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        avatar: '',
      };
      const expectedUser = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        avatar: 'https://ui-avatars.com/api/?name=testuser&background=00f3ff&color=0a0a0f',
      };
      jest.spyOn(service as any, 'getAccessToken').mockReturnValue('mock-token');

      service.initSession().subscribe((user) => {
        expect(user).toEqual(expectedUser);
        done();
      });

      const validateReq = httpMock.expectOne(`${API_BASE_URL}/validate-session`);
      validateReq.flush({
        valid: true,
        user: mockUserResponse,
      });
    });
  });
});
