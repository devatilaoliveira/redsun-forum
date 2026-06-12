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

  protected readonly currentPassword: WritableSignal<string> = signal<string>("");
  protected readonly newPassword: WritableSignal<string> = signal<string>("");
  protected readonly confirmNewPassword: WritableSignal<string> = signal<string>("");
  protected readonly reauthenticationCode: WritableSignal<string> = signal<string>("");
  protected readonly isRecoveryFlow: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly requiresReauthentication: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly checkingSession: WritableSignal<boolean> = signal<boolean>(true);
  protected readonly sessionReady: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly inProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly passwordPattern: RegExp = /^.{8,100}$/;
  protected readonly requiresCurrentPassword: Signal<boolean> = computed<boolean>(() => !this.isRecoveryFlow());
  protected readonly canSubmit: Signal<boolean> = computed<boolean>(() =>
    this.sessionReady()
      && (!this.requiresCurrentPassword() || this.currentPassword().trim().length > 0)
      && this.passwordPattern.test(this.newPassword())
      && this.passwordPattern.test(this.confirmNewPassword())
      && this.newPassword() === this.confirmNewPassword()
      && (!this.requiresReauthentication() || this.reauthenticationCode().trim().length > 0)
      && !this.inProgress()
  );
  protected readonly EVariant = EVariant;

  ngOnInit(): void {
    void this._prepareSession();
  }

  protected onCurrentPasswordChange(value: string): void {
    this.currentPassword.set(value);
    this.errorMessage.set(null);
  }

  protected onNewPasswordChange(value: string): void {
    this.newPassword.set(value);
    this.errorMessage.set(null);
  }

  protected onConfirmNewPasswordChange(value: string): void {
    this.confirmNewPassword.set(value);
    this.errorMessage.set(null);
  }

  protected onReauthenticationCodeChange(value: string): void {
    this.reauthenticationCode.set(value);
    this.errorMessage.set(null);
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) {
      this.errorMessage.set(this._translateService.instant("CHANGE_PASSWORD_VALIDATION_ERROR"));
      return;
    }

    this.errorMessage.set(null);
    this.inProgress.set(true);
    from(this._supabaseAuthClient.updatePassword({
      password: this.newPassword(),
      currentPassword: this.requiresCurrentPassword() ? this.currentPassword() : undefined,
      nonce: this.requiresReauthentication() ? this.reauthenticationCode().trim() : undefined
    })).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: () => {
        this.currentPassword.set("");
        this.newPassword.set("");
        this.confirmNewPassword.set("");
        this.reauthenticationCode.set("");
        this.requiresReauthentication.set(false);
        void this._router.navigate(["/", ROUTE_PATHS.profileDetails], {replaceUrl: true});
      },
      error: (error: unknown) => {
        void this._handlePasswordChangeError(error);
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
        this.isRecoveryFlow.set(true);
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

  private async _handlePasswordChangeError(error: unknown): Promise<void> {
    if (this._requiresReauthentication(error)) {
      try {
        await this._supabaseAuthClient.reauthenticate();
        this.requiresReauthentication.set(true);
        this.reauthenticationCode.set("");
        this.errorMessage.set(this._translateService.instant("CHANGE_PASSWORD_REAUTH_REQUIRED"));
        return;
      } catch {
        this.errorMessage.set(this._translateService.instant("CHANGE_PASSWORD_REAUTH_FAILED"));
        return;
      }
    }

    this.errorMessage.set(this._resolveError(error));
  }

  private _resolveError(error: unknown): string {
    const message: string = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    if (message.includes("session")) {
      return this._translateService.instant("CHANGE_PASSWORD_SESSION_REQUIRED");
    }

    if (message.includes("current password")) {
      return this._translateService.instant("CHANGE_PASSWORD_OLD_INVALID");
    }

    if (message.includes("different")) {
      return this._translateService.instant("CHANGE_PASSWORD_SAME_AS_OLD");
    }

    if (message.includes("password")) {
      return this._translateService.instant("CHANGE_PASSWORD_VALIDATION_ERROR");
    }

    return this._translateService.instant("CHANGE_PASSWORD_FAILED");
  }

  private _requiresReauthentication(error: unknown): boolean {
    const message: string = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    return message.includes("reauthentication") || message.includes("nonce");
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
