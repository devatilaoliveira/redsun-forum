import {Component, computed, inject, OnInit, Signal, signal, WritableSignal} from "@angular/core";
import {Router} from "@angular/router";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {finalize, from, firstValueFrom} from "rxjs";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {EVariant} from "../../../interface/enums/EVariant";
import {IAuthService, AuthService} from "../../../services/auth.service";
import {ISupabaseAuthClient, SupabaseAuthClientAdapter} from "../../../services/supabase-auth-client.adapter";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";

@Component({
  selector: "rs-change-password",
  standalone: true,
  imports: [TranslatePipe, RsButton, RsInput],
  templateUrl: "./change-password.view.html",
  styleUrl: "./change-password.view.scss"
})
export class ChangePasswordView implements OnInit {
  private readonly _authService: IAuthService = inject(AuthService);
  private readonly _supabaseAuthClient: ISupabaseAuthClient = inject(SupabaseAuthClientAdapter);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _router: Router = inject(Router);

  protected readonly newPassword: WritableSignal<string> = signal<string>("");
  protected readonly confirmNewPassword: WritableSignal<string> = signal<string>("");
  protected readonly checkingSession: WritableSignal<boolean> = signal<boolean>(true);
  protected readonly sessionReady: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly inProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly passwordPattern: RegExp = /^.{8,100}$/;
  protected readonly canSubmit: Signal<boolean> = computed<boolean>(() =>
    this.sessionReady()
      && this.passwordPattern.test(this.newPassword())
      && this.passwordPattern.test(this.confirmNewPassword())
      && this.newPassword() === this.confirmNewPassword()
      && !this.inProgress()
  );
  protected readonly EVariant = EVariant;

  ngOnInit(): void {
    void this._prepareSession();
  }

  protected onNewPasswordChange(value: string): void {
    this.newPassword.set(value);
    this.errorMessage.set(null);
  }

  protected onConfirmNewPasswordChange(value: string): void {
    this.confirmNewPassword.set(value);
    this.errorMessage.set(null);
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) {
      this.errorMessage.set(this._translateService.instant("CHANGE_PASSWORD_VALIDATION_ERROR"));
      return;
    }

    this.errorMessage.set(null);
    this.inProgress.set(true);
    from(this._supabaseAuthClient.updatePassword(this.newPassword())).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: () => {
        this.newPassword.set("");
        this.confirmNewPassword.set("");
        void this._router.navigate(["/", ROUTE_PATHS.profileDetails], {replaceUrl: true});
      },
      error: (error: unknown) => {
        this.errorMessage.set(this._resolveError(error));
      }
    });
  }

  protected onBack(): void {
    void this._router.navigate(["/", ROUTE_PATHS.profileDetails]);
  }

  protected onBackToLogin(): void {
    void this._router.navigate(["/", ROUTE_PATHS.login]);
  }

  private async _prepareSession(): Promise<void> {
    const url: URL = new URL(window.location.href);
    const error: string | null = url.searchParams.get("error");
    const code: string | null = url.searchParams.get("code");

    if (error) {
      this.errorMessage.set(this._translateService.instant("CHANGE_PASSWORD_RESET_LINK_FAILED"));
      this.checkingSession.set(false);
      return;
    }

    try {
      if (code) {
        await this._supabaseAuthClient.exchangeCodeForSession(code);
        window.history.replaceState({}, "", `/${ROUTE_PATHS.changePassword}`);
        await firstValueFrom(this._authService.completeSignIn());
      }

      const session = await this._authService.getCurrentSession();
      if (!session) {
        this.errorMessage.set(this._translateService.instant("CHANGE_PASSWORD_SESSION_REQUIRED"));
        return;
      }

      this.sessionReady.set(true);
    } catch {
      await this._authService.logout();
      this.errorMessage.set(this._translateService.instant("CHANGE_PASSWORD_RESET_LINK_FAILED"));
    } finally {
      this.checkingSession.set(false);
    }
  }

  private _resolveError(error: unknown): string {
    const message: string = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    if (message.includes("session")) {
      return this._translateService.instant("CHANGE_PASSWORD_SESSION_REQUIRED");
    }

    if (message.includes("different")) {
      return this._translateService.instant("CHANGE_PASSWORD_SAME_AS_OLD");
    }

    if (message.includes("password")) {
      return this._translateService.instant("CHANGE_PASSWORD_VALIDATION_ERROR");
    }

    return this._translateService.instant("CHANGE_PASSWORD_FAILED");
  }

  protected getConfirmPasswordPattern(): RegExp {
    const password: string = this.newPassword();
    if (!this.passwordPattern.test(password)) {
      return this.passwordPattern;
    }

    return this._buildExactMatchPattern(password);
  }

  private _buildExactMatchPattern(value: string): RegExp {
    const escaped: string = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^${escaped}$`);
  }
}
