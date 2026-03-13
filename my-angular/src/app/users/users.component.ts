import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { UserUtilsService } from '../services/user-utils.service';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  standalone: false
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  currentUserId: string = '';
  friends: string[] = [];

  constructor(
    private authService: AuthService,
    public userService: UserService,
    public userUtils: UserUtilsService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentUserId = this.authService.getCurrentUser()!.id;
    this.users = await this.userService.getAllUsers();
    
    this.friends = await this.userService.getFriends();

    this.friends = await this.userService.getFriends();
  
  }

  isFriend(userId: string): boolean {
    const userIdNum = Number(userId);
    return this.friends.some(friendId => Number(friendId) === userIdNum);
  }

  async onAddFriend(userId: string) {
    const res = await this.userService.addFriend(userId);
    console.log(res);
    if (res.friends) this.friends = res.friends;
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
}
