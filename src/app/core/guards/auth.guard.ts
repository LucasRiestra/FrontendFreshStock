import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard checking URL:', state.url);
  console.log('Is authenticated:', authService.isAuthenticated);

  if (authService.isAuthenticated) {
    return true;
  }

  console.warn('Access denied by AuthGuard, redirecting to login');
  // Not logged in, redirect to login page with return url
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
