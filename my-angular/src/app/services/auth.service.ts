import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  middleName?: string;
  birthDate?: string;
  photo?: string | null;
  role?: string;
  status?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
  isLoggedIn?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3001/api/auth';
  private apiUserUrl = 'http://localhost:3001/api';
  private currentUser: User | null = null;
  private authCheckPromise: Promise<boolean> | null = null;
  private authChecked = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Начинаем проверку авторизации при загрузке приложения
    this.checkAuth();
  }

  // Регистрация
  async register(userData: any): Promise<AuthResponse> {
    try {
      const response = await this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).toPromise();

      if (response && response.success && response.user) {
        this.currentUser = response.user;
        this.router.navigate(['/home']);
      }

      return response || { success: false, error: 'No response' };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.error?.error || 'Connection error'
      };
    }
  }

  // Вход
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).toPromise();

      if (response && response.success && response.user) {
        this.currentUser = response.user;
        this.router.navigate(['/home']);
      }

      return response || { success: false, error: 'No response' };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.error?.error || 'Connection error'
      };
    }
  }

  // Выход
  async logout(): Promise<AuthResponse> {
    try {
      const response = await this.http.post<AuthResponse>(`${this.apiUrl}/logout`, {}).toPromise();

      if (response && response.success) {
        this.currentUser = null;
        this.router.navigate(['/signin']);
      }

      return response || { success: false, error: 'No response' };
    } catch (error: any) {
      console.error('Logout error:', error);
      // Все равно разлогиниваем пользователя
      this.currentUser = null;
      this.router.navigate(['/signin']);
      return { success: false, error: 'Connection error' };
    }
  }

  // Проверка статуса авторизации
  private async checkAuth(): Promise<void> {
    try {
      const response = await this.http.get<AuthResponse>(`${this.apiUrl}/check`).toPromise();
      console.log('Auth check response:', response);

      if (response && response.isLoggedIn && response.user) {
        this.currentUser = response.user;
      } else {
        this.currentUser = null;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      this.currentUser = null;
    } finally {
      this.authChecked = true;
    }
  }

  // Метод для гвардов - ждет завершения проверки авторизации
  async waitForAuthCheck(): Promise<boolean> {
    // Если проверка уже завершена, возвращаем текущий статус
    if (this.authChecked) {
      return this.isAuthenticated();
    }

    // Если проверка еще не начата, запускаем ее
    if (!this.authCheckPromise) {
      this.authCheckPromise = this.checkAuth().then(() => {
        return this.isAuthenticated();
      });
    }

    // Ждем завершения проверки
    return await this.authCheckPromise;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  // Метод для принудительной повторной проверки
  async recheckAuth(): Promise<void> {
    this.authChecked = false;
    this.authCheckPromise = null;
    await this.checkAuth();
  }

  async deleteAccount(): Promise<any> {

    try {
      const userId = this.getCurrentUser()?.id;
      if (!userId) {
        throw new Error('User not found');
      }
      const response = await this.http.delete(`${this.apiUserUrl}/user/${userId}`).toPromise();
      console.log('Account deleted:', response);

      this.currentUser = null;
      this.router.navigate(['/signin']);

      return response;
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw error;
    }
  }


}