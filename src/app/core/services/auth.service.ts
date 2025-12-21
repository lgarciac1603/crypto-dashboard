import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser: User | null = null;

  constructor() {}

  login(credentials: { usernameOrEmail: string; password: string }): Observable<LoginResponse> {
    // Fake data simulation
    const fakeUsers = [
      {
        id: '1',
        username: 'johndoe',
        email: 'john@example.com',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=00f3ff&color=0a0a0f',
      },
      {
        id: '2',
        username: 'admin',
        email: 'admin@crypto.com',
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=00f3ff&color=0a0a0f',
      },
    ];

    const user = fakeUsers.find(
      (u) => u.username === credentials.usernameOrEmail || u.email === credentials.usernameOrEmail
    );

    if (user && credentials.password === 'password') {
      // Fake password check
      this.currentUser = user;
      return of({
        success: true,
        user: user,
        token: 'fake-jwt-token-' + user.id,
      }).pipe(delay(1000)); // Simulate API delay
    } else {
      return of({
        success: false,
        message: 'Invalid credentials',
      }).pipe(delay(1000));
    }
  }

  logout(): void {
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
}
