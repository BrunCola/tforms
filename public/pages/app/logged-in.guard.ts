// logged-in.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { LoginService } from './login/login.service';

// sessionStorage = when window is closed it resets
// localStorage = when cache is cleared it is reset

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(private user: LoginService, private router: Router) {}
    canActivate() {
        if (this.user.isLoggedIn()) { // all ok, proceed navigation to routed component
            return true;
          } else { // start a new navigation to redirect to login page
            this.router.navigate(['/login']);
            return false;
    }
  }
}