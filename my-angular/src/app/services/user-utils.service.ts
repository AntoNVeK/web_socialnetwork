import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // будет доступен во всем приложении
})
export class UserUtilsService {

  translateStatus(status: string | undefined): string {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'blocked':
        return 'Заблокирован';
      case 'unconfirmed':
        return 'Не подтвержден';
      default:
        return 'Неизвестно';
    }
  }

  translateRole(role: string | undefined): string {
    switch (role) {
      case 'user':
        return 'Пользователь';
      case 'admin':
        return 'Администратор';
      default:
        return 'Неизвестно';
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'blocked':
        return 'status-blocked';
      case 'unconfirmed':
        return 'status-unconfirmed';
      default:
        return 'status-unknown';
    }
  }
}
