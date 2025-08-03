import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/pages/home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AdminComponent } from './admin/admin.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminComponent,canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'shop', loadChildren: () => import('./modules/shop/shop.module').then(m => m.ShopModule), canActivate: [AuthGuard] },
  { path: 'blog', loadChildren: () => import('./modules/blog/blog.module').then(m => m.BlogModule), canActivate: [AuthGuard] },
  { path: 'cart', loadChildren: () => import('./modules/cart/cart.module').then(m => m.CartModule), canActivate: [AuthGuard] },
];



@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
