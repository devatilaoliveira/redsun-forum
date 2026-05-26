import {Component, inject, OnInit, signal, WritableSignal} from "@angular/core";
import {Router} from "@angular/router";
import {firstValueFrom} from "rxjs";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {EVariant} from "../../../interface/enums/EVariant";
import {IAuthService, AuthService} from "../../../services/auth.service";
import {ISupabaseAuthClient, SupabaseAuthClientAdapter} from "../../../services/supabase-auth-client.adapter";
import {RedsunTitle} from "../../shared/fragments/redsunTitle/redsun.title";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {PublicLegalFooterComponent} from "../../shared/ui/public-legal-footer/public-legal-footer.component";

@Component({
  selector: "rs-auth-verified",
  standalone: true,
  imports: [TranslatePipe, RedsunTitle, RsButton, PublicLegalFooterComponent],
  templateUrl: "./auth-verified.view.html",
  styleUrl: "./auth-verified.view.scss"
})
export class AuthVerifiedView implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _authService: IAuthService = inject(AuthService);
  private readonly _supabaseAuthClient: ISupabaseAuthClient = inject(SupabaseAuthClientAdapter);
  private readonly _translateService: ITranslateService = inject(TranslateService);

  protected readonly EVariant = EVariant;
  protected readonly inProgress: WritableSignal<boolean> = signal<boolean>(true);
  protected readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);

  ngOnInit(): void {
    void this._handleVerificationReturn();
  }

  protected onGoToLogin(): void {
    void this._router.navigate(["/", ROUTE_PATHS.login]);
  }

  private async _handleVerificationReturn(): Promise<void> {
    const url: URL = new URL(window.location.href);
    const error: string | null = url.searchParams.get("error");
    const code: string | null = url.searchParams.get("code");

    if (error) {
      this.errorMessage.set(this._translateService.instant("VERIFIED_FAILED"));
      this.inProgress.set(false);
      return;
    }

    try {
      if (code) {
        await this._supabaseAuthClient.exchangeCodeForSession(code);
        window.history.replaceState({}, "", `/${ROUTE_PATHS.authVerified}`);
      }

      const session = await this._authService.getCurrentSession();
      if (!session) {
        this.inProgress.set(false);
        return;
      }

      await firstValueFrom(this._authService.completeSignIn());
      await this._router.navigate(["/"], {replaceUrl: true});
    } catch {
      await this._authService.logout();
      this.errorMessage.set(this._translateService.instant("VERIFIED_FAILED"));
      this.inProgress.set(false);
    }
  }
}
