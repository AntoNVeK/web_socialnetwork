import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const UnauthGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  try {
    // Ждем завершения проверки авторизации
    const isAuthenticated = await authService.waitForAuthCheck();
    
    if (!isAuthenticated) {
      return true;
    } else {
      console.log('UnauthGuard: User already authenticated, redirecting to profile');
      router.navigate(['/home']);
      return false;
    }
  } catch (error) {
    console.error('UnauthGuard error:', error);
    return true; // Разрешаем доступ к страницам авторизации при ошибке
  }
};