import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-page',
  standalone: false,
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {
  
  constructor(
    public authService: AuthService,
    public userService: UserService,
    private router: Router
  ) {}

  isAdmin(): boolean {
    const user = this.userService.getCurrentUser();
    return user?.role === 'admin';
  }

  // Навигационные методы
  goToUsers() {
    this.router.navigate(['/users']);
  }

  goToFriends() {
    this.router.navigate(['/friends']);
  }

  goToNews() {
    this.router.navigate(['/news']);
  }

  goToAdmin() {
    window.open('http://localhost/users.html', '_blank');
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}