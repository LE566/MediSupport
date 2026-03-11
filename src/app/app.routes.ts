import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.page').then( m => m.AuthPage)
    
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage),
    canActivate: [authGuard] 
  },
  {
    path: 'appointmentsDoc',
    loadComponent: () => import('./pages/appointments-doc/appointments-doc.page').then( m => m.AppointmentsDocPage),
    canActivate: [authGuard] 
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage),
    canActivate: [authGuard] 
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.page').then( m => m.SettingsPage),
    canActivate: [authGuard] 
  },
  {
    path: 'appointmentsPatient',
    loadComponent: () => import('./pages/appointments-patient/appointments-patient.page').then( m => m.AppointmentsPatientPage),
    canActivate: [authGuard] 
  },
  {
    path: 'cancer-classifier',
    loadComponent: () => import('./pages/cancer-classifier/cancer-classifier.page').then( m => m.CancerClassifierPage),
    canActivate: [authGuard] 
  },
];