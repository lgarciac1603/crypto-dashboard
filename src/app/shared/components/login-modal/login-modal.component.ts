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

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials = this.loginForm.value;

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
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onClose();
  }
}
