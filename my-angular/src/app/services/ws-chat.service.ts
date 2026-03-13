import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  date: string;
}

interface CreateChatMessage {
  senderId: string;
  receiverId: string;
  text: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class WsChatService {
  private ws: WebSocket | null = null;
  private allChats: Record<string, ChatMessage[]> = {};
  private currentChatId: string | null = null;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  constructor(private auth: AuthService) {}

  private getChatId(friendId: string): string {
    const currentUserId = this.auth.getCurrentUser()!.id;
    const [a, b] = [String(currentUserId), String(friendId)];
    return `${a}_${b}`;
  }

  private connect(friendId: string) {
    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.ws = new WebSocket(`ws://localhost:3001/ws?chatId=${this.getChatId(friendId)}`);

    this.ws.onopen = () => console.log('✅ WS подключен');

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data.channel === 'chat' && data.message) {
        const message = data.message;
        const currentUserId = this.auth.getCurrentUser()!.id;
        let chatId = "";
        if ((message.senderId == currentUserId && message.receiverId == friendId) ||
          (message.receiverId == currentUserId && message.senderId == friendId)
        ) {
            chatId =  this.getNormalizeChatId(message.senderId, message.receiverId)
        }
        console.log(chatId)
        if (!this.allChats[chatId]) {
          this.allChats[chatId] = [];
        }
        this.allChats[chatId].push(message);
        if (this.currentChatId && this.allChats[this.currentChatId]) {
          this.messagesSubject.next(this.allChats[this.currentChatId]);
        }
      } else if (data.channel === 'chat' && data.chatId && data.messages) {
        console.log(data.chatId)
        this.allChats[data.chatId] = data.messages;
        if (data.chatId === this.currentChatId) {
          this.messagesSubject.next(data.messages);
        }
      } else if (data.channel === "deletemessage" && data.message) {
        const message = data.message;
        const currentUserId = this.auth.getCurrentUser()!.id;
        let chatId = "";
        if ((message.senderId == currentUserId && message.receiverId == friendId) ||
          (message.receiverId == currentUserId && message.senderId == friendId)
        ) {
            chatId =  this.getNormalizeChatId(message.senderId, message.receiverId)
        }
        console.log(message.date);
        console.log(this.allChats[chatId]);
        this.allChats[chatId] = this.allChats[chatId].filter( mes => !(mes.date === message.date && mes.receiverId === message.receiverId && mes.senderId === message.senderId));
        console.log(this.allChats[chatId]);
        if (chatId === this.currentChatId) {
          this.messagesSubject.next(this.allChats[chatId]);
        }
      }
    };

    this.ws.onclose = () => console.log('⚠️ WS закрыт');
  }

  ensureConnected(friendId: string) {
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.connect(friendId);
    }
  }

  openChat(friendId: string) {
    this.currentChatId = this.getChatId(friendId);
    if (this.allChats[this.currentChatId]) {
      this.messagesSubject.next(this.allChats[this.currentChatId]);
    } else {
      this.messagesSubject.next([]);
    }
  }

  sendMessage(receiverId: string, text: string) {
    const user = this.auth.getCurrentUser();
    if (!user || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message: CreateChatMessage & { type: string } = {
      type: 'chat',
      senderId: user.id,
      receiverId,
      text,
      date: new Date().toISOString()
    };

    this.ws.send(JSON.stringify(message));
  }

  deleteMessage(receiverId: string, messageDate: string, id: string) {
    const user = this.auth.getCurrentUser();
    if (!user || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({
      type: 'deleteMessage',
      senderId: user.id,
      receiverId,
      date: messageDate,
      id: id
    }));
  }

  closeConnection(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // первыId - тек пользователь
  private getNormalizeChatId(senderId: string, receiverId: string): string {
    const currentUserId = this.auth.getCurrentUser()!.id;


    const [a, b] = [currentUserId, currentUserId == senderId ? receiverId : senderId];
    return `${a}_${b}`;
  }
}
