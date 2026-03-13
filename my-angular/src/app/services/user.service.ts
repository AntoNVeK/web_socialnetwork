import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';


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

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  user?: T;
}

export interface FriendsResponse {
  success: boolean;
  message?: string;
  error?: string;
  friends?: string[];
}

@Injectable({
  providedIn: 'root'
})

export class UserService {
  private apiUserUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient, private authService: AuthService) {

  }

  getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  getPhotoUrl(photoPath: string | null | undefined): string {
    if (!photoPath) return '';

    // Простая замена /assets/ на /client-images/
    return `http://localhost:3001${photoPath}`;
  }

  getInitials(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  }

  getFullName(): string {
    const user = this.getCurrentUser();
    if (!user) return '';
    return `${user.lastName} ${user.firstName} ${user.middleName || ''}`.trim();
  }

  getFormattedDate(dateString: string | undefined): string {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  }

  hasPhoto(): boolean {
    return !!this.getCurrentUser()?.photo;
  }

  getCurrentUserPhotoUrl(): string {
    const user = this.getCurrentUser();
    const photo = user?.photo;

    if (photo === null || photo === undefined) {
      return '';
    }

    return this.getPhotoUrl(photo);
  }

  getStatusText(): string {
    const user = this.getCurrentUser();
    const status = user?.status;

    switch (status) {
      case 'active': return 'Активный';
      case 'blocked': return 'Заблокированный';
      case 'unconfirmed': return 'Не подтверждённый';
      default: return status || 'Не указан';
    }
  }

  

  getRoleText(): string {
    const user = this.getCurrentUser();
    const role = user?.role;

    switch (role) {
      case 'user': return 'Пользователь';
      case 'admin': return 'Администратор';
      default: return role || 'Не указана';
    }
  }

  getFieldValue(field: keyof User, defaultValue: string = 'Не указано'): string {
    const user = this.getCurrentUser();
    const value = user?.[field];
    return value || defaultValue;
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getCurrentUserId(): string {
    const user = this.getCurrentUser();
    return user?.id || '';
  }




  setCurrentUser(user: User): void {
    this.authService.setCurrentUser(user);
  }

  async uploadPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await this.http.post<{ url: string }>(`${this.apiUserUrl}/upload-photo`, formData).toPromise();
      return response?.url || '';
    } catch (error) {
      console.error('Upload photo error:', error);
      throw error;
    }
  }
  async updateProfile(formData: FormData): Promise<ApiResponse<User>> {
    try {
      // Для отладки - посмотрим что отправляется
      console.log('Updating user ID:', this.getCurrentUserId());
      formData.forEach((value, key) => {
        console.log(`FormData field: ${key} =`, value);
      });

      const response = await this.http.put<ApiResponse<User>>(
        `${this.apiUserUrl}/user/${this.getCurrentUserId()}`,
        formData
      ).toPromise();

      if (!response) {
        throw new Error('No response from server');
      }

      // Обновляем текущего пользователя
      if (response.success && response.user) {
        this.setCurrentUser(response.user);
      }

      return response;

    } catch (error: any) {
      console.error('Update profile with photo error:', error);
      throw error;
    }
  }


 async getAllUsers(): Promise<User[]> {
  try {
    const response = await this.http
      .get<ApiResponse<Record<string, User>>>(`${this.apiUserUrl}/users`)
      .toPromise();

    if (!response) throw new Error('No response from server');

    
    if (response.success && response.user) {
      const usersArray = Object.entries(response.user).map(([id, user]) => ({
        ...user,
        id: user.id
      }));

      return usersArray;
    } else {
      throw new Error(response.error || response.message || 'Failed to fetch users');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}



  async getFriends(): Promise<string[]> {
  try {
    const currentUserId = this.getCurrentUserId();
    const response = await this.http
      .get<FriendsResponse>(`${this.apiUserUrl}/user/${currentUserId}/friends`)
      .toPromise();
    
    if (!response) throw new Error('No response from server');
    console.log(response);
    console.log('2. RAW RESPONSE:', response);
    console.log('5. BODY:', response.friends);
    if (response.success) {
      return response.friends || [];
    } else {
      throw new Error(response.error || response.message || 'Failed to fetch friends');
    }
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
}

  async addFriend(friendId: string): Promise<any> {
    try {
      const currentUserId = this.getCurrentUserId();
      const response = await this.http.post<object>(  // <object> вместо конкретного типа
      `${this.apiUserUrl}/user/${currentUserId}/friends`,
      friendId,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    ).toPromise();
      console.log('Raw response:', response);
      if (!response) {
        throw new Error('No response from server');
      }

      return response;
    } catch (error) {
      console.error('Error adding friend:', error);
      throw error;
    }
  }


  async removeFriend(friendId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const currentUserId = this.getCurrentUserId();
    const response = await this.http
      .delete<{ success: boolean; message?: string }>(
        `${this.apiUserUrl}/user/${currentUserId}/friends/${friendId}`
      )
      .toPromise();

    return response || { success: false, message: 'Нет ответа от сервера' };
  } catch (error) {
    console.error('Ошибка при удалении друга:', error);
    throw error;
  }
}
  async getUserNameById(userId: string): Promise<string> {
  const response = await this.http
    .get<{ success: boolean; name: string }>(`${this.apiUserUrl}/user/${userId}/name`)
    .toPromise();
    
  return response?.name || 'Неизвестный';
}
}
