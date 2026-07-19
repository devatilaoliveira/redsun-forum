import {inject, Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {Session} from "@supabase/supabase-js";
import {TranslateService} from "@ngx-translate/core";
import {ROUTE_PATHS} from "../../interface/constants/route-path.constants";
import {IPrinter, Printer} from "../miscellaneous/printer.handler";
import {LocalStoreService} from "../../services/local-store.service";
import {MeResponseDTO} from "../../interface/dtos/user/MeResponseDTO";
import {IToastService, ToastService} from "../../services/toast.service";
import {EVariant} from "../../interface/enums/EVariant";

@Injectable({providedIn: "root"})
export class AuthGuard implements CanActivate, CanActivateChild {
  private readonly _auth: AuthService = inject(AuthService);
  private readonly _router: Router = inject(Router);
  private readonly _translateService: TranslateService = inject(TranslateService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _localStoreService: LocalStoreService = inject(LocalStoreService);
  private readonly _toastService: IToastService = inject(ToastService);

  async canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    return this.checkAccess(state.url);
  }

  async canActivateChild(_: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    return this.checkAccess(state.url);
  }

  private async checkAccess(targetUrl: string): Promise<boolean | UrlTree> {
    try {
      const session: Session | null = await this._auth.getCurrentSession();
      if (!session) {
        return this._router.createUrlTree([ROUTE_PATHS.login]);
      }

      if (this._isLegalAcceptanceUrl(targetUrl)) {
        return true;
      }

      const user: MeResponseDTO | null = this._localStoreService.user();
      if (!user?.legalAcknowledgement?.current) {
        return this._router.createUrlTree([`/${ROUTE_PATHS.legalAcceptance}`], {
          queryParams: {
            returnUrl: targetUrl || "/"
          }
        });
      }

      return true;
    } catch (error) {
      const msg = this._translateService.instant("ERROR_VALIDATING_SESSION");
      this._printer.error(msg, error);
      this._toastService.show({
        label: this._translateService.instant("WARNING"),
        message: this._translateService.instant("SESSION_CONNECTION_RETRY"),
        variant: EVariant.WARNING,
        durationMs: 6000
      });
      return false;
    }
  }

  private _isLegalAcceptanceUrl(url: string): boolean {
    const path: string = url.split("?")[0] ?? "";
    return path === `/${ROUTE_PATHS.legalAcceptance}`;
  }
}
