import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const AuthGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  try {
    // Ждем завершения проверки авторизации
    const isAuthenticated = await authService.waitForAuthCheck();
    
    if (isAuthenticated) {
      return true;
    } else {
      console.log('AuthGuard: User not authenticated, redirecting to signin');
      router.navigate(['/signin']);
      return false;
    }
  } catch (error) {
    console.error('AuthGuard error:', error);
    router.navigate(['/signin']);
    return false;
  }
};