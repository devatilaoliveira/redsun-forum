import {inject, Injectable} from "@angular/core";
import {CanMatch} from "@angular/router";
import {AuthService, IAuthService} from "../../services/auth.service";
import {Session} from "@supabase/supabase-js";
import {ITranslateService, TranslateService} from "@ngx-translate/core";
import {IPrinter, Printer} from "../miscellaneous/printer.handler";

@Injectable({providedIn: "root"})
export class GuestGuard implements CanMatch {
  private readonly _auth: IAuthService = inject(AuthService);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _printer: IPrinter = inject(Printer);

  async canMatch(): Promise<boolean> {
    return this.checkMatchAccess();
  }

  private async checkMatchAccess(): Promise<boolean> {
    try {
      const session: Session | null = await this._auth.getCurrentSession();
      return !session;
    } catch (error) {
      const msg = this._translateService.instant("USER_CANNOT_BE_AUTHENTICATED_TO_NAVIGATE_TO_LOGIN");
      this._printer.error(msg, error);
      return true;
    }
  }
}
