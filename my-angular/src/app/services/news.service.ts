import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service'; // для получения текущего userId

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class WsNewsService implements OnDestroy {
  private ws!: WebSocket;
  private newsSubject = new BehaviorSubject<NewsItem[]>([]);
  news$ = this.newsSubject.asObservable();

  constructor(private authService: AuthService) {
    this.connect();
  }

  private connect() {
    const userId = this.authService.getCurrentUser()!.id;
    if (!userId) return;

    this.ws = new WebSocket(`ws://localhost:3001/ws?userId=${userId}`);

    this.ws.onopen = () => {
      console.log('✅ WebSocket подключен');
    };

    this.ws.onmessage = (event: MessageEvent) => { // получаем данные
      try {
        const data = JSON.parse(event.data) as { channel: string; feed: NewsItem[] };
        console.log(Array.isArray(data.feed));
        if (data.channel === 'news' && Array.isArray(data.feed)) {
          console.log("second")
          this.newsSubject.next(
            data.feed.sort((a: NewsItem, b: NewsItem) => new Date(b.date).getTime() - new Date(a.date).getTime())
          );
        }
      } catch (err) {
        console.error('Ошибка обработки WS сообщения:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('❌ WebSocket отключен');
    };

    this.ws.onerror = (err) => {
      console.error('Ошибка WS:', err);
      this.ws.close();
    };
  }
  sendNews(title: string, content: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const userId = this.authService.getCurrentUser()!.id;

      const currentNews = this.newsSubject.getValue().filter(n => n.id.startsWith(`n${userId}_`));

      // Извлекаем числовые индексы из id (n{userId}_{index})
      const indices = currentNews.map(n => {
        const parts = n.id.split('_');
        return Number(parts[1]) || 0;
      });

      // Находим максимум
      const maxIndex = indices.length > 0 ? Math.max(...indices) : 0;

      // Следующий id
      const nextIndex = maxIndex + 1;
      const newsItem = {
        type: 'add',
        id: `n${userId}_${nextIndex}`,
        title,
        content,
        date: new Date().toISOString()
      };
      console.log(newsItem);

      this.ws.send(JSON.stringify(newsItem));
      // console.log(`📤 Отправлена новость ${newsItem.id}`);
    } else {
      console.warn('⚠️ WebSocket не подключен. Новость не отправлена.');
    }
  }
  ensureConnected() {
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.connect();
    }
  }
  deleteNews(id: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'delete', id }));
    }
  }

  ngOnDestroy() {
    this.ws?.close();
  }
}
