import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CryptoDetail } from './features/crypto-detail/crypto-detail';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'login', component: DashboardComponent, canActivate: [guestGuard] },
  { path: 'crypto/:id', component: CryptoDetail },
  { path: '**', redirectTo: '' },
];
