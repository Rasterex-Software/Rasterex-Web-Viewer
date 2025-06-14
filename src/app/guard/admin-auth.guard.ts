import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const permissions = JSON.parse(localStorage.getItem('adminPermission') || 'null');

  const isAdmin = permissions?.permission?.key === 'AdminAccess';
  if (!isAdmin) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
