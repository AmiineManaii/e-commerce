import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Rediriger vers la page de connexion
  return router.parseUrl('/login');
};

export const nonAuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
  return router.parseUrl('/');
};