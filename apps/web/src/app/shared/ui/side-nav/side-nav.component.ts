import {DOCUMENT, NgOptimizedImage} from "@angular/common";
import {
  Component,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  ViewChild,
  WritableSignal
} from "@angular/core";
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {AuthService, IAuthService} from "../../../../services/auth.service";
import {IPrinter, Printer} from "../../../../infra/miscellaneous/printer.handler";
import {RsButton} from "../../fragments/rsButton/rs.button";
import {EVariant} from "../../../../interface/enums/EVariant";
import {IStyleMap} from "../../../../interface/models/istyle-map";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {RsSideNavItem} from "../../../../interface/models/side-nav-item";

@Component({
  selector: "rs-side-nav",
  standalone: true,
  imports: [TranslatePipe, RsButton, NgOptimizedImage, RouterLink, RouterLinkActive],
  templateUrl: "./side-nav.component.html",
  styleUrl: "./side-nav.component.scss"
})
export class RsSideNavComponent {
  @ViewChild("drawer")
  private drawerRef?: ElementRef<HTMLElement>;

  public readonly navSelected: OutputEmitterRef<void> = output<void>();
  public readonly menuOpen: InputSignal<boolean> = input<boolean>(false);
  public readonly navItems: InputSignal<RsSideNavItem[]> = input<RsSideNavItem[]>([]);
  public readonly showLogoutBtn: InputSignal<boolean> = input<boolean>(false);
  public readonly sideNavId: InputSignal<string> = input<string>("top-bar-sidenav");
  protected readonly EVariant = EVariant;
  protected readonly supportRoutePath: string = `/${ROUTE_PATHS.support}`;

  protected inProgress: WritableSignal<boolean> = signal(false);
  protected isVisible: WritableSignal<boolean> = signal(false);
  protected isClosing: WritableSignal<boolean> = signal(false);
  protected readonly customStyle: IStyleMap = { justifyContent: "flex-start", display: "flex", width: "100%" };
  private readonly closeAnimationMs = 200;
  private closeTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private readonly _authService: IAuthService = inject(AuthService);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _router: Router = inject(Router);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _document: Document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      if (this.menuOpen()) {
        if (this.closeTimeoutId) {
          clearTimeout(this.closeTimeoutId);
          this.closeTimeoutId = null;
        }

        this.isClosing.set(false);
        this.isVisible.set(true);
        setTimeout(() => this.focusDrawer(), 0);
        return;
      }

      this.inProgress.set(false);

      if (!this.isVisible()) {
        this.isClosing.set(false);
        return;
      }

      this.isClosing.set(true);
      if (this.closeTimeoutId) {
        clearTimeout(this.closeTimeoutId);
      }
      this.closeTimeoutId = setTimeout(() => {
        this.isClosing.set(false);
        this.isVisible.set(false);
        this.closeTimeoutId = null;
      }, this.closeAnimationMs);
    });
  }

  protected handleNavSelection(): void {
    this.inProgress.set(true);
    this.navSelected.emit();
  }


  protected async logout(): Promise<void> {
    this.inProgress.set(true);
    this.navSelected.emit();
    try {
      await this._authService.logout().then(() => {
        this._router.navigate(["/", ROUTE_PATHS.login]);
      });
    } catch (error) {
      const msg = this._translateService.instant("FAILED_LOGOUT");
      this._printer.error(msg, error);
    } finally {
      this.inProgress.set(false);
    }
  }

  protected requestClose(): void {
    if (!this.menuOpen()) {
      return;
    }

    this.navSelected.emit();
  }

  protected onDrawerKeydown(event: KeyboardEvent): void {
    if (!this.menuOpen() || event.key !== "Tab") {
      return;
    }

    this.trapFocus(event);
  }

  private focusDrawer(): void {
    if (!this.menuOpen()) {
      return;
    }

    const drawer: HTMLElement | undefined = this.drawerRef?.nativeElement;
    if (!drawer) {
      return;
    }

    const focusable: HTMLElement[] = this.getFocusableElements(drawer);
    if (focusable.length > 0) {
      focusable[0].focus();
      return;
    }

    drawer.focus();
  }

  private trapFocus(event: KeyboardEvent): void {
    const drawer: HTMLElement | undefined = this.drawerRef?.nativeElement;
    if (!drawer) {
      return;
    }

    const focusable: HTMLElement[] = this.getFocusableElements(drawer);
    if (focusable.length === 0) {
      event.preventDefault();
      drawer.focus();
      return;
    }

    const first: HTMLElement = focusable[0];
    const last: HTMLElement = focusable[focusable.length - 1];
    const active: Element | null = this._document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const elements: NodeListOf<HTMLElement> = container.querySelectorAll(
      "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])"
    );

    return Array.from(elements).filter((element) => !element.hasAttribute("disabled"));
  }
}
