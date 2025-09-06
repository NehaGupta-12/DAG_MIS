/* eslint-disable @typescript-eslint/no-unused-vars */
import {NgClass, NgIf} from '@angular/common';
import {
  Router,
  NavigationEnd,
  RouterLinkActive,
  RouterLink,
} from '@angular/router';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  DOCUMENT
} from '@angular/core';
import { RouteInfo } from './sidebar.metadata';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { NgScrollbar } from 'ngx-scrollbar';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { SidebarService } from './sidebar.service';
import {UserDataModel} from "../../module/add-user/UserData.model";
import {AuthService} from "app/authentication/auth.service"

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [
    NgScrollbar,
    RouterLinkActive,
    RouterLink,
    NgClass,
    FeatherModule,
    TranslateModule,
    NgIf,
  ]
})
export class SidebarComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  public sidebarItems!: RouteInfo[];
  public innerHeight?: number;
  public bodyTag!: HTMLElement;
  listMaxHeight?: string;
  listMaxWidth?: string;
  headerHeight = 60;
  userName :any;
  role :any
  userData!: UserDataModel

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private auth : AuthService,
    private router: Router,
    private sidebarService: SidebarService,
  ) {
    super();
    this.subs.sink = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // close sidebar on mobile screen after menu select
        this.renderer.removeClass(this.document.body, 'overlay-open');
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  windowResizecall() {
    this.setMenuHeight();
    this.checkStatuForResize(false);
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.renderer.removeClass(this.document.body, 'overlay-open');
    }
  }
  callToggleMenu(event: Event, length: number) {
    if (length > 0) {
      const parentElement = (event.target as HTMLInputElement).closest('li');
      const activeClass = parentElement?.classList.contains('active');

      if (activeClass) {
        this.renderer.removeClass(parentElement, 'active');
      } else {
        this.renderer.addClass(parentElement, 'active');
      }
    }
  }

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('userData')!) as UserDataModel
    this.userName = `${this.userData.first || ''} ${this.userData.last || ''}`.trim();
    this.role = this.userData.role
    if (this.auth.currentUserValue) {
      this.subs.sink = this.sidebarService
        .getRouteInfo()
        .subscribe((routes: RouteInfo[]) => {
          this.sidebarItems = routes.filter((sidebarItem) => sidebarItem);
        });
    }
    this.initLeftSidebar();
    this.bodyTag = this.document.body;
  }


  initLeftSidebar() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    // Set menu height
    _this.setMenuHeight();
    _this.checkStatuForResize(true);
  }
  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }
  isOpen() {
    return this.bodyTag.classList.contains('overlay-open');
  }
  checkStatuForResize(firstTime: boolean) {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'ls-closed');
    } else {
      this.renderer.removeClass(this.document.body, 'ls-closed');
    }
  }
  mouseHover() {
    const body = this.elementRef.nativeElement.closest('body');

    if (body.classList.contains('submenu-closed')) {
      this.renderer.addClass(this.document.body, 'side-closed-hover');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    }
  }
  mouseOut() {
    const body = this.elementRef.nativeElement.closest('body');

    if (body.classList.contains('side-closed-hover')) {
      this.renderer.removeClass(this.document.body, 'side-closed-hover');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }
}
