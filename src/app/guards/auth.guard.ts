import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.getCurrentUser()?.id) {
    return true;
  }

  // MODE DEV : aucun utilisateur connecté -> redirection vers login avec returnUrl
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state?.url || route?.url?.toString() || '/' } });
};

export const nonAuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  return router.parseUrl('/');
};
