import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: false,
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  
  constructor(
    public authService: AuthService,
    public userService: UserService,
    private router: Router
  ) {
    console.log("Current user:", this.userService.getCurrentUser());
  }

  async logout() {
    await this.authService.logout();
  }
  goHome() {
    this.router.navigate(['/home']);
  }
  
  onPhotoError(event: any) {
    console.error('Failed to load photo');
    event.target.style.display = 'none';
  }

  editProfile() {
    this.router.navigate(['/edit-profile']);
  }

  
}