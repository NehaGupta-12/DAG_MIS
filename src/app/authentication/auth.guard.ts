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
    // allow all authentication pages
    console.log('Guard checking', state.url);

    if (state.url.startsWith('/dashboard/main')) {
      return true;
    }

    const userData = localStorage.getItem('userData');
    const rolePermissions = localStorage.getItem('userRolePermissions');

    // Not logged in → redirect to sign in
    if (!userData || !rolePermissions) {
      return this.router.parseUrl('/authentication/signin');
    }

    const permissions = JSON.parse(rolePermissions);
    const currentPath = state.url;

    // Validate route against menus + permissions
    return runInInjectionContext(this.injector, () =>
      this.menuService.fetchMenus().pipe(
        map((menus: any[]) => {
          const matchedMenu = menus.find((m) =>
            currentPath.includes(m.menu_url)
          );

          if (!matchedMenu) {
            return this.router.parseUrl('/authentication/access-denied');
          }

          const userMenuPermission = permissions.find(
            (p: any) => p.menuId === matchedMenu.id // or menu_name as per your data
          );

          if (userMenuPermission && userMenuPermission.permissions?.showMenu) {
            return true;
          }

          return this.router.parseUrl('/authentication/access-denied');
        }),
        catchError(() => of(this.router.parseUrl('/authentication/access-denied')))
      )
    );
  }
}
