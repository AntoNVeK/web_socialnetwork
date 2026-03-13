import { Component, Input, Output, EventEmitter } from '@angular/core';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { UserUtilsService } from '../services/user-utils.service';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css'],
  standalone: false
})
export class UserCardComponent {
  @Input() user!: User;
  @Input() currentUserId!: string;
  @Input() isFriend: boolean = false;
  @Input() mode: 'users' | 'friends' = 'users';

  @Output() addFriend = new EventEmitter<string>();
  @Output() removeFriend = new EventEmitter<string>();
  @Output() writeMessage = new EventEmitter<string>();

  constructor(
    public userService: UserService,
    public userUtils: UserUtilsService
  ) {}

  onAddFriend() {
    this.addFriend.emit(this.user.id);
  }

  onRemoveFriend() {
    this.removeFriend.emit(this.user.id);
  }

  onWriteMessage() {
    this.writeMessage.emit(this.user.id);
  }
}
