import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, LoginResponse } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<any>();

  authForm: FormGroup;
  mode: 'login' | 'register' = 'login';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.authForm = this.fb.group({
      username: [''],
      usernameOrEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: [''],
    });
  }

  onSubmit(): void {
    this.successMessage = '';

    if (this.mode === 'login') {
      this.submitLogin();
      return;
    }

    this.submitRegister();
  }

  setMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.errorMessage = '';
    this.successMessage = '';

    if (mode === 'register') {
      this.authForm.get('username')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.authForm.get('confirmPassword')?.setValidators([Validators.required]);
    } else {
      this.authForm.get('username')?.clearValidators();
      this.authForm.get('confirmPassword')?.clearValidators();
    }

    this.authForm.get('username')?.updateValueAndValidity();
    this.authForm.get('confirmPassword')?.updateValueAndValidity();
  }

  private submitLogin(): void {
    if (this.authForm.get('usernameOrEmail')?.invalid || this.authForm.get('password')?.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      usernameOrEmail: this.authForm.get('usernameOrEmail')?.value,
      password: this.authForm.get('password')?.value,
    };

    this.authService.login(credentials).subscribe({
      next: (response: LoginResponse) => {
        this.isLoading = false;
        if (response.success && response.user) {
          this.loginSuccess.emit(response.user);
          this.close.emit();
        } else {
          this.errorMessage = response.message || 'Login failed';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again.';
        console.error('Login error:', error);
      },
    });
  }

  private submitRegister(): void {
    const username = this.authForm.get('username')?.value?.trim();
    const email = this.authForm.get('usernameOrEmail')?.value;
    const password = this.authForm.get('password')?.value;
    const confirmPassword = this.authForm.get('confirmPassword')?.value;

    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({ username, email, password }).subscribe({
      next: (response) => {
        if (!response.success) {
          this.isLoading = false;
          this.errorMessage = response.message || 'Registration failed';
          return;
        }

        this.successMessage = 'Account created. Logging you in...';
        this.authService.login({ usernameOrEmail: email, password }).subscribe({
          next: (loginResponse) => {
            this.isLoading = false;

            if (loginResponse.success && loginResponse.user) {
              this.loginSuccess.emit(loginResponse.user);
              this.close.emit();
              return;
            }

            this.setMode('login');
            this.successMessage = 'Account created successfully. Please login.';
          },
          error: () => {
            this.isLoading = false;
            this.setMode('login');
            this.successMessage = 'Account created successfully. Please login.';
          },
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again.';
        console.error('Register error:', error);
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onClose();
  }
}
