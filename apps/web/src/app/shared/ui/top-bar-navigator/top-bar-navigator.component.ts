import {DOCUMENT, Location} from "@angular/common";
import {Component, computed, DestroyRef, effect, HostListener, inject, OnInit, signal, Signal, WritableSignal} from "@angular/core";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ActivatedRoute, NavigationEnd, Router, UrlTree} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {filter} from "rxjs";
import {RedsunTitle} from "../../fragments/redsunTitle/redsun.title";
import {RsRoundIconButton} from "../../fragments/rsRoundIconButton/rs.round-icon-button";
import {RsSideNavComponent} from "../side-nav/side-nav.component";
import {RsSideNavItem} from "../../../../interface/models/side-nav-item";
import {DEFAULT_SIDE_NAV_ITEMS} from "../../../../interface/constants/side-nav.constants";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {TaleContextStateService} from "../../../../stateServices/tale-context-state.service";
import {AppSettingsService, IAppSettingsService} from "../../../../services/app-settings.service";
import {resolvePreferredHomeUrl} from "../../../../infra/miscellaneous/preferred-home.functions";
import {RedsunLogo} from "../../fragments/redsunLogo/redsun.logo";

@Component({
  selector: "rs-top-bar-navigator",
  standalone: true,
  imports: [RedsunTitle, RedsunLogo, RsRoundIconButton, RsSideNavComponent, TranslatePipe],
  templateUrl: "./top-bar-navigator.component.html",
  styleUrl: "./top-bar-navigator.component.scss"
})
export class RsTopBarNavigatorComponent implements OnInit {
  protected readonly hideTopBar: WritableSignal<boolean> = signal(true);
  protected readonly hideBackBtn: WritableSignal<boolean> = signal(false);
  protected readonly backTarget: WritableSignal<UrlTree | null> = signal(null);
  protected readonly menuOpen: WritableSignal<boolean> = signal(false);
  protected readonly manageMenuOpen: WritableSignal<boolean> = signal(false);
  protected readonly playerMenuOpen: WritableSignal<boolean> = signal(false);
  protected readonly sideNavId: string = "top-bar-sidenav";
  protected readonly manageSideNavId: string = "manage-sidenav";
  protected readonly playerSideNavId: string = "player-sidenav";
  protected readonly showLogoutBtn: boolean = true;
  protected readonly menuNavItems: RsSideNavItem[] = DEFAULT_SIDE_NAV_ITEMS;
  protected readonly manageVisible: Signal<boolean>;
  protected readonly playerVisible: Signal<boolean>;
  protected readonly manageNavItems: WritableSignal<RsSideNavItem[]> = signal([]);
  protected readonly playerNavItems: WritableSignal<RsSideNavItem[]> = signal([]);
  protected readonly preferredHomeUrl: Signal<string> = computed(() => resolvePreferredHomeUrl(
    this._appSettingsService.redirectToFavorite(),
    this._appSettingsService.favoriteTaleId()
  ));
  protected readonly preferredHomeLabelKey: Signal<string> = computed(() =>
    this.preferredHomeUrl() === "/" ? "GO_TO_HOME" : "GO_TO_FAVORITE_CAMPAIGN"
  );


  private previousBodyOverflow: string | null = null;
  private readonly _location: Location = inject(Location);
  private readonly _router: Router = inject(Router);
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _document: Document = inject(DOCUMENT);
  private readonly _taleState: TaleContextStateService = inject(TaleContextStateService);
  private readonly _appSettingsService: IAppSettingsService = inject(AppSettingsService);

  constructor() {
    this.manageVisible = this._taleState.canManage;
    this.playerVisible = this._taleState.canPlay;

    effect(() => {
      const manageVisible: boolean = this.manageVisible();
      const playerVisible: boolean = this.playerVisible();

      if (this.hideTopBar()) {
        this.closeAllMenus();
        return;
      }

      if (!manageVisible) {
        this.closeManageMenu();
      }

      if (!playerVisible || manageVisible) {
        this.closePlayerMenu();
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
        this.closeAllMenus();
      });
    this._destroyRef.onDestroy(() => {
      if (this.menuOpen() || this.manageMenuOpen() || this.playerMenuOpen()) {
        this.unlockScroll();
        this.restoreMainInteractivity();
      }
    });
  }

  protected onMenuToggle(): void {
    if (this.menuOpen()) {
      this.closeMenu();
      return;
    }

    if (this.manageMenuOpen()) {
      this.closeManageMenu();
    }

    if (this.playerMenuOpen()) {
      this.closePlayerMenu();
    }

    this.openMenu();
  }

  protected closeMenu(): void {
    if (!this.menuOpen()) {
      return;
    }

    this.menuOpen.set(false);
    this.unlockScroll();
    this.restoreMainInteractivity();
  }

  protected onManageToggle(): void {
    if (!this.manageVisible()) {
      return;
    }

    if (this.manageMenuOpen()) {
      this.closeManageMenu();
      return;
    }

    if (this.menuOpen()) {
      this.closeMenu();
    }

    if (this.playerMenuOpen()) {
      this.closePlayerMenu();
    }

    this.openManageMenu();
  }

  protected onPlayerToggle(): void {
    if (!this.playerVisible()) {
      return;
    }

    if (this.playerMenuOpen()) {
      this.closePlayerMenu();
      return;
    }

    if (this.menuOpen()) {
      this.closeMenu();
    }

    if (this.manageMenuOpen()) {
      this.closeManageMenu();
    }

    this.openPlayerMenu();
  }

  protected closeManageMenu(): void {
    if (!this.manageMenuOpen()) {
      return;
    }

    this.manageMenuOpen.set(false);
    this.unlockScroll();
    this.restoreMainInteractivity();
  }

  protected closePlayerMenu(): void {
    if (!this.playerMenuOpen()) {
      return;
    }

    this.playerMenuOpen.set(false);
    this.unlockScroll();
    this.restoreMainInteractivity();
  }

  @HostListener("document:keydown", ["$event"])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== "Escape" || (!this.menuOpen() && !this.manageMenuOpen() && !this.playerMenuOpen())) {
      return;
    }

    event.preventDefault();
    if (this.manageMenuOpen()) {
      this.closeManageMenu();
      return;
    }

    if (this.playerMenuOpen()) {
      this.closePlayerMenu();
      return;
    }

    this.closeMenu();
  }

  protected onBack(): void {
    if (this.hideBackBtn()) {
      return;
    }

    const backTarget: UrlTree | null = this.backTarget();
    if (backTarget) {
      this.navigateTo(backTarget);
      return;
    }

    this._location.back();
  }

  protected onBrandClick(): void {
    void this._router.navigateByUrl(this.preferredHomeUrl());
  }

  private openMenu(): void {
    if (this.menuOpen()) {
      return;
    }

    this.menuOpen.set(true);
    this.lockScroll();
    this.disableMainInteractivity();
  }

  private openManageMenu(): void {
    if (this.manageMenuOpen()) {
      return;
    }

    this.manageMenuOpen.set(true);
    this.lockScroll();
    this.disableMainInteractivity();
  }

  private openPlayerMenu(): void {
    if (this.playerMenuOpen()) {
      return;
    }

    this.playerMenuOpen.set(true);
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
    this.hideBackBtn.set(data["hideBackBtn"] === true);
    this.hideTopBar.set(data["hideTopBar"] === true);
    this.backTarget.set(backTo ?? null);
    this.updateManageItems(route);
    this.updatePlayerItems(route);

    if (this.hideTopBar()) {
      this.closeAllMenus();
    }
  }

  private closeAllMenus(): void {
    if (this.menuOpen()) {
      this.closeMenu();
    }
    if (this.manageMenuOpen()) {
      this.closeManageMenu();
    }
    if (this.playerMenuOpen()) {
      this.closePlayerMenu();
    }
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
      this.manageNavItems.update((items) => items.filter((item) =>
        item.label !== "MANAGE_TALE" && item.label !== "MANAGE_PARTICIPANTS" && item.label !== "MANAGE_PROFILE"
      ));
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
    const otherItems = this.manageNavItems().filter((item) =>
      item.label !== "MANAGE_TALE" && item.label !== "MANAGE_PARTICIPANTS" && item.label !== "MANAGE_PROFILE"
    );
    this.manageNavItems.set([manageItem, participantsItem, manageCharacterItem, ...otherItems]);
  }

  private updatePlayerItems(route: ActivatedRoute): void {
    const taleId: string | null = route.snapshot.paramMap.get(ROUTE_PATHS.taleId);
    if (!taleId) {
      this.playerNavItems.update((items) => items.filter((item) => item.label !== "MANAGE_PROFILE"));
      return;
    }

    const manageCharacterItem: RsSideNavItem = {
      iconAddress: "/assets/svgs/profile.svg",
      label: "MANAGE_PROFILE",
      routePath: `/${ROUTE_PATHS.tales}/${taleId}/${ROUTE_PATHS.profile}`,
      exact: true
    };
    const otherItems = this.playerNavItems().filter((item) => item.label !== "MANAGE_PROFILE");
    this.playerNavItems.set([manageCharacterItem, ...otherItems]);
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
