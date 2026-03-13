import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './sign-in.component.html',
  standalone: false,
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  signInForm: FormGroup;
  hidePassword = true;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.signInForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const credentials = {
        email: this.signInForm.get('email')?.value,
        password: this.signInForm.get('password')?.value
      };

      try {
        const result: AuthResponse = await this.authService.login(credentials);
        
        if (result.success) {
          console.log('Вход успешен:', result.user);
          // Автоматический переход в ProfileComponent через AuthService
        } else {
          this.errorMessage = result.error || result.message || 'Ошибка входа';
          console.error('Ошибка входа:', result);
        }
      } catch (error) {
        this.errorMessage = 'Ошибка соединения с сервером';
        console.error('Ошибка при входе:', error);
      } finally {
        this.loading = false;
      }
    } else {
      // Показываем ошибки валидации
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  goToSignUp() {
    this.router.navigate(['/signup']);
  }

  private markFormGroupTouched() {
    Object.keys(this.signInForm.controls).forEach(key => {
      const control = this.signInForm.get(key);
      control?.markAsTouched();
    });
  }

  // Геттеры для удобного доступа к полям формы в шаблоне
  get email() { return this.signInForm.get('email'); }
  get password() { return this.signInForm.get('password'); }
}