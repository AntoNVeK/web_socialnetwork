import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthGuard } from './guards/auth.guard';
import { UnauthGuard } from './guards/unauth.guard';
import { MainPageComponent } from './main-page/main-page.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { UsersComponent } from './users/users.component';
import { FriendsComponent } from './friends/friends.component';
import { NewsComponent } from './news/news.component';
import { ChatComponent } from './chat/chat.component'
const routes: Routes = [
  { path: '', redirectTo: '/signin', pathMatch: 'full' },
  { path: 'signup', component: LoginComponent, canActivate: [UnauthGuard] },
  { path: 'signin', component: SignInComponent, canActivate: [UnauthGuard] },
  { path: 'home', component: MainPageComponent, canActivate: [AuthGuard]},
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'edit-profile', component: EditProfileComponent, canActivate: [AuthGuard]},
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard]},
  { path: 'friends', component: FriendsComponent, canActivate: [AuthGuard]},
  { path: 'news', component: NewsComponent, canActivate: [AuthGuard]},
  { path: 'chat/:friendId', component: ChatComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: '/signin' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }