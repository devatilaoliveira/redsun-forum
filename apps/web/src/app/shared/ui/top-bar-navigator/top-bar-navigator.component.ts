import {DOCUMENT, Location} from "@angular/common";
import {Component, DestroyRef, effect, ElementRef, HostListener, inject, OnInit, Signal, ViewChild} from "@angular/core";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ActivatedRoute, NavigationEnd, Router, UrlTree} from "@angular/router";
import {filter} from "rxjs";
import {RedsunTitle} from "../../fragments/redsunTitle/redsun.title";
import {RsRoundIconButton} from "../../fragments/rsRoundIconButton/rs.round-icon-button";
import {RsSideNavComponent} from "../side-nav/side-nav.component";
import {RsSideNavItem} from "../../../../interface/models/side-nav-item";
import {DEFAULT_SIDE_NAV_ITEMS} from "../../../../interface/constants/side-nav.constants";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {TaleContextStateService} from "../../../../stateServices/tale-context-state.service";

@Component({
  selector: "rs-top-bar-navigator",
  standalone: true,
  imports: [RedsunTitle, RsRoundIconButton, RsSideNavComponent],
  templateUrl: "./top-bar-navigator.component.html",
  styleUrl: "./top-bar-navigator.component.scss"
})
export class RsTopBarNavigatorComponent implements OnInit {
  @ViewChild("menuButton", { read: ElementRef })
  private menuButtonRef?: ElementRef<HTMLElement>;

  @ViewChild("manageButton", { read: ElementRef })
  private manageButtonRef?: ElementRef<HTMLElement>;

  @ViewChild("playerButton", { read: ElementRef })
  private playerButtonRef?: ElementRef<HTMLElement>;

  protected hideTopBar: boolean = false;
  protected hideBackBtn: boolean = false;
  protected backTarget: UrlTree | null = null;
  protected menuOpen: boolean = false;
  protected manageMenuOpen: boolean = false;
  protected playerMenuOpen: boolean = false;
  protected readonly sideNavId: string = "top-bar-sidenav";
  protected readonly manageSideNavId: string = "manage-sidenav";
  protected readonly playerSideNavId: string = "player-sidenav";
  protected readonly showLogoutBtn: boolean = true;
  protected readonly menuNavItems: RsSideNavItem[] = DEFAULT_SIDE_NAV_ITEMS;
  protected readonly manageVisible: Signal<boolean>;
  protected readonly playerVisible: Signal<boolean>;
  protected manageNavItems: RsSideNavItem[] = [];
  protected playerNavItems: RsSideNavItem[] = [];


  private previousBodyOverflow: string | null = null;
  private readonly _location: Location = inject(Location);
  private readonly _router: Router = inject(Router);
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _document: Document = inject(DOCUMENT);
  private readonly _taleState: TaleContextStateService = inject(TaleContextStateService);

  constructor() {
    this.manageVisible = this._taleState.canManage;
    this.playerVisible = this._taleState.canPlay;

    effect(() => {
      if (!this.manageVisible()) {
        this.closeManageMenu(false);
      }

      if (!this.playerVisible() || this.manageVisible()) {
        this.closePlayerMenu(false);
      }
    });
  }

  ngOnInit(): void {
    this.updateRouteState();
    this._router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() => {
        this.updateRouteState();
        if (this.menuOpen) {
          this.closeMenu();
        }
        if (this.manageMenuOpen) {
          this.closeManageMenu(false);
        }
        if (this.playerMenuOpen) {
          this.closePlayerMenu(false);
        }
      });
    this._destroyRef.onDestroy(() => {
      if (this.menuOpen || this.manageMenuOpen || this.playerMenuOpen) {
        this.unlockScroll();
        this.restoreMainInteractivity();
      }
    });
  }

  protected onMenuToggle(): void {
    if (this.menuOpen) {
      this.closeMenu();
      return;
    }

    if (this.manageMenuOpen) {
      this.closeManageMenu(false);
    }

    if (this.playerMenuOpen) {
      this.closePlayerMenu(false);
    }

    this.openMenu();
  }

  protected closeMenu(restoreFocus: boolean = true): void {
    if (!this.menuOpen) {
      return;
    }

    this.menuOpen = false;
    this.unlockScroll();
    this.restoreMainInteractivity();
    if (restoreFocus) {
      this.restoreMenuButtonFocus();
    }
  }

  protected onManageToggle(): void {
    if (!this.manageVisible()) {
      return;
    }

    if (this.manageMenuOpen) {
      this.closeManageMenu();
      return;
    }

    if (this.menuOpen) {
      this.closeMenu(false);
    }

    if (this.playerMenuOpen) {
      this.closePlayerMenu(false);
    }

    this.openManageMenu();
  }

  protected onPlayerToggle(): void {
    if (!this.playerVisible()) {
      return;
    }

    if (this.playerMenuOpen) {
      this.closePlayerMenu();
      return;
    }

    if (this.menuOpen) {
      this.closeMenu(false);
    }

    if (this.manageMenuOpen) {
      this.closeManageMenu(false);
    }

    this.openPlayerMenu();
  }

  protected closeManageMenu(restoreFocus: boolean = true): void {
    if (!this.manageMenuOpen) {
      return;
    }

    this.manageMenuOpen = false;
    this.unlockScroll();
    this.restoreMainInteractivity();
    if (restoreFocus) {
      this.restoreManageButtonFocus();
    }
  }

  protected closePlayerMenu(restoreFocus: boolean = true): void {
    if (!this.playerMenuOpen) {
      return;
    }

    this.playerMenuOpen = false;
    this.unlockScroll();
    this.restoreMainInteractivity();
    if (restoreFocus) {
      this.restorePlayerButtonFocus();
    }
  }

  @HostListener("document:keydown", ["$event"])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== "Escape" || (!this.menuOpen && !this.manageMenuOpen && !this.playerMenuOpen)) {
      return;
    }

    event.preventDefault();
    if (this.manageMenuOpen) {
      this.closeManageMenu();
      return;
    }

    if (this.playerMenuOpen) {
      this.closePlayerMenu();
      return;
    }

    this.closeMenu();
  }

  protected onBack(): void {
    if (this.hideBackBtn) {
      return;
    }

    if (this.backTarget) {
      this.navigateTo(this.backTarget);
      return;
    }

    this._location.back();
  }

  protected onLogoClick(): void {
    void this._router.navigate(["/"]);
  }

  private openMenu(): void {
    if (this.menuOpen) {
      return;
    }

    this.menuOpen = true;
    this.lockScroll();
    this.disableMainInteractivity();
  }

  private openManageMenu(): void {
    if (this.manageMenuOpen) {
      return;
    }

    this.manageMenuOpen = true;
    this.lockScroll();
    this.disableMainInteractivity();
  }

  private openPlayerMenu(): void {
    if (this.playerMenuOpen) {
      return;
    }

    this.playerMenuOpen = true;
    this.lockScroll();
    this.disableMainInteractivity();
  }

  private navigateTo(target: UrlTree): void {
    void this._router.navigateByUrl(target);
  }

  private updateRouteState(): void {
    const route: ActivatedRoute = this.getDeepestRoute(this._activatedRoute);
    const data: Record<string, unknown> = route.snapshot.data ?? {};
    const { backTo } = data as { backTo?: UrlTree };
    this.hideBackBtn = data["hideBackBtn"] === true;
    this.hideTopBar = data["hideTopBar"] === true;
    this.backTarget = backTo ?? null;
    this.updateManageItems(route);
    this.updatePlayerItems(route);
  }

  private getDeepestRoute(route: ActivatedRoute): ActivatedRoute {
    let currentRoute: ActivatedRoute = route;

    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    return currentRoute;
  }

  private updateManageItems(route: ActivatedRoute): void {
    const taleId: string | null = route.snapshot.paramMap.get(ROUTE_PATHS.taleId);
    if (!taleId) {
      this.manageNavItems = this.manageNavItems.filter((item) =>
        item.label !== "MANAGE_TALE" && item.label !== "MANAGE_PARTICIPANTS" && item.label !== "MANAGE_PROFILE"
      );
      return;
    }

    const manageItem: RsSideNavItem = {
      iconAddress: "/assets/svgs/settings.svg",
      label: "MANAGE_TALE",
      routePath: `/${ROUTE_PATHS.tales}/${taleId}/${ROUTE_PATHS.manage}`,
      exact: true
    };
    const participantsItem: RsSideNavItem = {
      iconAddress: "/assets/svgs/contacts.svg",
      label: "MANAGE_PARTICIPANTS",
      routePath: `/${ROUTE_PATHS.tales}/${taleId}/${ROUTE_PATHS.manage}/${ROUTE_PATHS.participants}`,
      exact: true
    };
    const manageCharacterItem: RsSideNavItem = {
      iconAddress: "/assets/svgs/profile.svg",
      label: "MANAGE_PROFILE",
      routePath: `/${ROUTE_PATHS.tales}/${taleId}/${ROUTE_PATHS.profile}`,
      exact: true
    };
    const otherItems = this.manageNavItems.filter((item) =>
      item.label !== "MANAGE_TALE" && item.label !== "MANAGE_PARTICIPANTS" && item.label !== "MANAGE_PROFILE"
    );
    this.manageNavItems = [manageItem, participantsItem, manageCharacterItem, ...otherItems];
  }

  private updatePlayerItems(route: ActivatedRoute): void {
    const taleId: string | null = route.snapshot.paramMap.get(ROUTE_PATHS.taleId);
    if (!taleId) {
      this.playerNavItems = this.playerNavItems.filter((item) => item.label !== "MANAGE_PROFILE");
      return;
    }

    const manageCharacterItem: RsSideNavItem = {
      iconAddress: "/assets/svgs/profile.svg",
      label: "MANAGE_PROFILE",
      routePath: `/${ROUTE_PATHS.tales}/${taleId}/${ROUTE_PATHS.profile}`,
      exact: true
    };
    const otherItems = this.playerNavItems.filter((item) => item.label !== "MANAGE_PROFILE");
    this.playerNavItems = [manageCharacterItem, ...otherItems];
  }

  private restoreMenuButtonFocus(): void {
    const menuButton: HTMLElement | null = this.getMenuButton();
    if (menuButton) {
      menuButton.focus();
    }
  }

  private restoreManageButtonFocus(): void {
    const manageButton: HTMLElement | null = this.getManageButton();
    if (manageButton) {
      manageButton.focus();
    }
  }

  private restorePlayerButtonFocus(): void {
    const playerButton: HTMLElement | null = this.getPlayerButton();
    if (playerButton) {
      playerButton.focus();
    }
  }

  private getMenuButton(): HTMLElement | null {
    const host: HTMLElement | undefined = this.menuButtonRef?.nativeElement;
    if (!host) {
      return null;
    }

    if (host instanceof HTMLButtonElement) {
      return host;
    }

    return host.querySelector("button");
  }

  private getManageButton(): HTMLElement | null {
    const host: HTMLElement | undefined = this.manageButtonRef?.nativeElement;
    if (!host) {
      return null;
    }

    if (host instanceof HTMLButtonElement) {
      return host;
    }

    return host.querySelector("button");
  }

  private getPlayerButton(): HTMLElement | null {
    const host: HTMLElement | undefined = this.playerButtonRef?.nativeElement;
    if (!host) {
      return null;
    }

    if (host instanceof HTMLButtonElement) {
      return host;
    }

    return host.querySelector("button");
  }

  private lockScroll(): void {
    if (this.previousBodyOverflow === null) {
      this.previousBodyOverflow = this._document.body.style.overflow;
    }
    this._document.body.style.overflow = "hidden";
  }

  private unlockScroll(): void {
    if (this.previousBodyOverflow === null) {
      return;
    }

    this._document.body.style.overflow = this.previousBodyOverflow;
    this.previousBodyOverflow = null;
  }

  private disableMainInteractivity(): void {
    const mainElement: Element | null = this._document.querySelector("main");
    if (!(mainElement instanceof HTMLElement)) {
      return;
    }

    mainElement.setAttribute("aria-hidden", "true");
    mainElement.setAttribute("inert", "");
  }

  private restoreMainInteractivity(): void {
    const mainElement: Element | null = this._document.querySelector("main");
    if (!(mainElement instanceof HTMLElement)) {
      return;
    }

    mainElement.removeAttribute("aria-hidden");
    mainElement.removeAttribute("inert");
  }
}
