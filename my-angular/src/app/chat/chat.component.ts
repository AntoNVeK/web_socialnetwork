import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { WsChatService } from '../services/ws-chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: false
})
export class ChatComponent implements OnInit, OnDestroy {
  friendId!: string;
  currentUserId!: string;
  friendName = '';
  messages: { senderId: string; receiverId: string; text: string; date: string }[] = [];
  chatForm!: FormGroup;
  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private wsChat: WsChatService,
    public userService: UserService
  ) {}

  async ngOnInit() {
    this.currentUserId = String(this.auth.getCurrentUser()!.id); // приводим к строке
    this.friendId = this.route.snapshot.paramMap.get('friendId')!;

    this.chatForm = this.fb.group({
      message: ['', Validators.required]
    });

    this.wsChat.ensureConnected(this.friendId);
    this.wsChat.openChat(this.friendId);

    this.sub = this.wsChat.messages$.subscribe(msgs => {
      this.messages = msgs;
    });

    this.friendName = await this.userService.getUserNameById(this.friendId);
  }

  sendMessage(): void {
    if (this.chatForm.invalid) return;
    const text = this.chatForm.value.message.trim();
    if (!text) return;

    this.wsChat.sendMessage(this.friendId, text);
    this.chatForm.reset();
  }

  deleteMessage(msg: { senderId: string; receiverId: string; text: string; date: string, id: string }) {
    if (!confirm('Вы уверены, что хотите удалить это сообщение?')) return;
    this.wsChat.deleteMessage(this.friendId, msg.date, msg.id);
  }

  isOwnMessage(msg: { senderId: string }): boolean {
    return String(msg.senderId) === this.currentUserId;
  }

  goBack(): void {
    this.wsChat.closeConnection();
    this.sub?.unsubscribe();
    this.router.navigate(['/friends']);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.wsChat.closeConnection();
  }
}
