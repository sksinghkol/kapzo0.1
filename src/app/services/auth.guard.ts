import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseService } from './firebase.service';

export const AuthGuard: CanActivateFn = async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const firebaseService = inject(FirebaseService);

  // Server side render case
  if (!isPlatformBrowser(platformId)) return true;

  try {
    console.debug('[AuthGuard] checking access for', state?.url);
    const user = await firebaseService.getCurrentUser();
    console.debug('[AuthGuard] resolved user:', user);
    if (user) {
      return true; // allow
    } else {
  console.debug('[AuthGuard] no user, redirecting to /login');
  router.navigate(['/login'], { queryParams: { returnUrl: state?.url || '/' } });
      return false;
    }
  } catch (err) {
    console.error('AuthGuard error:', err);
    router.navigate(['/login']);
    return false;
  }
};
