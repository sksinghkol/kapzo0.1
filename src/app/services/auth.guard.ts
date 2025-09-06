import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseService } from './firebase.service';

export const AuthGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const firebaseService = inject(FirebaseService);

  // ✅ Server side render case
  if (!isPlatformBrowser(platformId)) return true;

  try {
    const user = await firebaseService.getCurrentUser();
    if (user) {
      return true; // allow
    } else {
      router.navigate(['/login']); // 👈 यहां `/` नहीं, `/login`
      return false;
    }
  } catch (err) {
    console.error('AuthGuard error:', err);
    router.navigate(['/login']);
    return false;
  }
};
