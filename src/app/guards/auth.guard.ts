import { User } from './../models/user';
import { take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { environment } from './../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  public hashcode: string;
  logsession: Logsession.Logsession;
  private newUser: User = new User();
    constructor(
        private router: Router,
        private authenticationService: AuthService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this.authenticationService.currentUserValue;
        if (route.params['hashcode'] === '') {
          console.log('auth.guard-15-hashcodevazio', route.params['hashcode']);
          if (currentUser) {
            // authorised so return true
            return true;
        } else {
          // not logged in so redirect to login page with the return url
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
          return false;
        }
        } else {
            this.hashcode = route.params['hashcode'];
            return true;
        }
    }
}
