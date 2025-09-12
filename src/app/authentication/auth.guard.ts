import {
  EnvironmentInjector,
  Injectable,
  runInInjectionContext,
} from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthService } from './auth.service';
import { MenuService } from '../Services/menu.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private menuService: MenuService,
    private injector: EnvironmentInjector,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | boolean | UrlTree {


    const userData = localStorage.getItem('userData');
    const rolePermissions = localStorage.getItem('userRolePermissions');
    const currentPath = state.url;

    if (userData && currentPath.startsWith('/dashboard/main')) {
      return true;
    }

    if (userData) {
      return true;
    }
   return this.router.parseUrl('/authentication/signin')
  }
}
