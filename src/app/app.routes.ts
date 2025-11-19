import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CryptoDetail } from './features/crypto-detail/crypto-detail';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'crypto/:id', component: CryptoDetail },
  { path: '**', redirectTo: '' },
];
