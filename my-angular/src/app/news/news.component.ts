import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WsNewsService, NewsItem } from '../services/news.service';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-news',
  standalone: false,
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit, OnDestroy {
  news: NewsItem[] = [];
  private sub!: Subscription;

  newsForm: FormGroup;
  currentUserId!: string;

  constructor(
    private wsNews: WsNewsService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUser()!.id;
    this.wsNews.ensureConnected();

    this.sub = this.wsNews.news$.subscribe(feed => {
      this.news = feed;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  createNews() {
    if (this.newsForm.invalid) return;

    const { title, content } = this.newsForm.value;
    this.wsNews.sendNews(title.trim(), content.trim());
    this.newsForm.reset();
  }

  deleteNews(id: string) {
    console.log(id);
    this.wsNews.deleteNews(id);
  }

  goToMain() {
    this.wsNews.ngOnDestroy();
    this.router.navigate(['/main']);
  }
}
