import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si tiene token, lo dejamos pasar
  if (authService.getToken()) {
    return true;
  }

  // Si no tiene, lo mandamos al login
  router.navigate(['/login']);
  return false;
};