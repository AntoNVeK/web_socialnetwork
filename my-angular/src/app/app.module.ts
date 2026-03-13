import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MainPageComponent } from './main-page/main-page.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { UsersComponent } from './users/users.component';
import { FriendsComponent } from './friends/friends.component';
import { NewsComponent } from './news/news.component';
import { ChatComponent } from './chat/chat.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { UserCardComponent } from './user-card/user-card.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignInComponent,
    ProfileComponent,
    MainPageComponent,
    EditProfileComponent,
    UsersComponent,
    FriendsComponent,
    NewsComponent,
    ChatComponent,
    UserCardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    
    ReactiveFormsModule,
    // Angular Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    ScrollingModule
  ],
  providers: [
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }