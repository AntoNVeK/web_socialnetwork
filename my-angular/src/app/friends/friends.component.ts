import { Component, OnInit } from '@angular/core';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { UserUtilsService } from '../services/user-utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css'],
  standalone: false
})
export class FriendsComponent implements OnInit {
  friends: User[] = [];
  currentUserId: string = '';
  isLoading = true;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    public userUtils: UserUtilsService
  ) {}

  async ngOnInit() {
    this.currentUserId = this.authService.getCurrentUser()!.id;
    const friendIds = await this.userService.getFriends();
    const allUsers = await this.userService.getAllUsers();
    this.friends = allUsers.filter(u => friendIds.includes(u.id));
    this.isLoading = false;
  }

  async onRemoveFriend(friendId: string) {
    const res = await this.userService.removeFriend(friendId);
    if (res.success) {
      this.friends = this.friends.filter(f => f.id !== friendId);
    }
  }

  onWriteMessage(friendId: string) {
    this.router.navigate(['/chat', friendId]);
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}
