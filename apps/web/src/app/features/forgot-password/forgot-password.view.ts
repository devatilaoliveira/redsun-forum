import {HttpErrorResponse} from "@angular/common/http";
import {Component, computed, inject, OnDestroy, Signal, signal, WritableSignal} from "@angular/core";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {finalize} from "rxjs";
import {Router} from "@angular/router";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {EVariant} from "../../../interface/enums/EVariant";
import {IEmailAuthService, EmailAuthService} from "../../../services/email-auth.service";
import {RequestPasswordResetCodeRequestDTO} from "../../../interface/dtos/auth/RequestPasswordResetCodeRequestDTO";
import {ResetPasswordWithCodeRequestDTO} from "../../../interface/dtos/auth/ResetPasswordWithCodeRequestDTO";
import {RedsunTitle} from "../../shared/fragments/redsunTitle/redsun.title";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {EMAIL_PATTERN} from "../../../interface/constants/pattern-validators";
import {PublicLegalFooterComponent} from "../../shared/ui/public-legal-footer/public-legal-footer.component";

@Component({
  selector: "rs-forgot-password",
  standalone: true,
  imports: [TranslatePipe, RedsunTitle, RsButton, RsInput, PublicLegalFooterComponent],
  templateUrl: "./forgot-password.view.html",
  styleUrl: "./forgot-password.view.scss"
})
export class ForgotPasswordView implements OnDestroy {
  private readonly _router: Router = inject(Router);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _emailAuthService: IEmailAuthService = inject(EmailAuthService);
  private _resendTimerId: ReturnType<typeof setInterval> | null = null;

  protected readonly codeRequested: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly inProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly resetInProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly resendInProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly submittedEmail: WritableSignal<string> = signal<string>("");
  protected readonly email: WritableSignal<string> = signal<string>("");
  protected readonly code: WritableSignal<string> = signal<string>("");
  protected readonly newPassword: WritableSignal<string> = signal<string>("");
  protected readonly confirmPassword: WritableSignal<string> = signal<string>("");
  protected readonly infoMessage: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly resendCooldownSeconds: WritableSignal<number> = signal<number>(0);
  protected readonly canResend: Signal<boolean> = computed<boolean>(() =>
    this.codeRequested()
    && this.resendCooldownSeconds() === 0
    && !this.inProgress()
    && !this.resendInProgress()
    && !this.resetInProgress()
  );
  protected readonly canReset: Signal<boolean> = computed<boolean>(() =>
    this.codeRequested()
    && this.verificationCodePattern.test(this.code().trim())
    && this.passwordPattern.test(this.newPassword())
    && this.passwordPattern.test(this.confirmPassword())
    && this.newPassword() === this.confirmPassword()
    && !this.inProgress()
    && !this.resetInProgress()
    && !this.resendInProgress()
  );

  protected readonly emailPattern: RegExp = EMAIL_PATTERN;
  protected readonly passwordPattern: RegExp = /^.{8,100}$/;
  protected readonly verificationCodePattern: RegExp = /^\d{6}$/;
  protected readonly EVariant = EVariant;

  protected onEmailChange(value: string): void {
    this.email.set(value);
    this.errorMessage.set(null);
  }

  protected onCodeChange(value: string): void {
    this.code.set(value);
    this.errorMessage.set(null);
  }

  protected onNewPasswordChange(value: string): void {
    this.newPassword.set(value);
    this.errorMessage.set(null);
  }

  protected onConfirmPasswordChange(value: string): void {
    this.confirmPassword.set(value);
    this.errorMessage.set(null);
  }

  protected onRequestCode(event?: Event): void {
    event?.preventDefault();
    if (this.inProgress()) {
      return;
    }

    const normalizedEmail: string = this.email().trim();
    if (!this.emailPattern.test(normalizedEmail)) {
      this.errorMessage.set(this._translateService.instant("FORGOT_PASSWORD_VALIDATION_ERROR"));
      return;
    }

    const payload: RequestPasswordResetCodeRequestDTO = {email: normalizedEmail};
    this.errorMessage.set(null);
    this.inProgress.set(true);
    this._emailAuthService.requestPasswordResetCode(payload).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: (message: string) => {
        this.codeRequested.set(true);
        this.submittedEmail.set(normalizedEmail);
        this.code.set("");
        this.newPassword.set("");
        this.confirmPassword.set("");
        this.infoMessage.set(this._resolveMessage(message, "FORGOT_PASSWORD_GENERIC_SUCCESS"));
        this._startResendCooldown();
      },
      error: (error: unknown) => {
        this.errorMessage.set(this._resolveRequestCodeError(error));
      }
    });
  }

  protected onResetPassword(): void {
    if (!this.canReset()) {
      this.errorMessage.set(this._translateService.instant("FORGOT_PASSWORD_RESET_VALIDATION_ERROR"));
      return;
    }

    const payload: ResetPasswordWithCodeRequestDTO = {
      email: this.submittedEmail().trim(),
      code: this.code().trim(),
      newPassword: this.newPassword()
    };

    this.errorMessage.set(null);
    this.resetInProgress.set(true);
    this._emailAuthService.resetPasswordWithCode(payload).pipe(
      finalize(() => this.resetInProgress.set(false))
    ).subscribe({
      next: () => {
        void this._router.navigate(["/", ROUTE_PATHS.login], {replaceUrl: true});
      },
      error: (error: unknown) => {
        this.errorMessage.set(this._resolveResetError(error));
      }
    });
  }

  protected onResendCode(): void {
    if (!this.canResend()) {
      return;
    }

    const email: string = this.submittedEmail().trim();
    if (!email) {
      this.errorMessage.set(this._translateService.instant("FORGOT_PASSWORD_REQUEST_FAILED"));
      return;
    }

    this.errorMessage.set(null);
    this.resendInProgress.set(true);
    this._emailAuthService.requestPasswordResetCode({email}).pipe(
      finalize(() => this.resendInProgress.set(false))
    ).subscribe({
      next: (message: string) => {
        this.infoMessage.set(this._resolveMessage(message, "FORGOT_PASSWORD_GENERIC_SUCCESS"));
        this._startResendCooldown();
      },
      error: (error: unknown) => {
        this.errorMessage.set(this._resolveRequestCodeError(error));
      }
    });
  }

  protected onUseAnotherEmail(): void {
    this.codeRequested.set(false);
    this.submittedEmail.set("");
    this.email.set("");
    this.code.set("");
    this.newPassword.set("");
    this.confirmPassword.set("");
    this.infoMessage.set(null);
    this.errorMessage.set(null);
    this.resendCooldownSeconds.set(0);
    this._clearResendTimer();
  }

  protected onBackToLogin(): void {
    void this._router.navigate(["/", ROUTE_PATHS.login]);
  }

  protected getResendButtonText(): string {
    const cooldown: number = this.resendCooldownSeconds();
    if (cooldown <= 0) {
      return this._translateService.instant("FORGOT_PASSWORD_RESEND_CODE");
    }

    return this._translateService.instant("RESEND_IN", {time: this._formatCooldown(cooldown)});
  }

  ngOnDestroy(): void {
    this._clearResendTimer();
  }

  private _resolveMessage(message: string | null | undefined, fallbackKey: string): string {
    const trimmedMessage: string = (message ?? "").trim();
    if (!trimmedMessage) {
      return this._translateService.instant(fallbackKey);
    }

    const directTranslatedMessage: string = this._translateService.instant(trimmedMessage);
    if (directTranslatedMessage !== trimmedMessage) {
      return directTranslatedMessage;
    }

    const mappedTranslationKey: string | null = this._mapServerMessageToTranslationKey(trimmedMessage);
    if (mappedTranslationKey) {
      return this._translateService.instant(mappedTranslationKey);
    }

    return this._translateService.instant(fallbackKey);
  }

  private _mapServerMessageToTranslationKey(message: string): string | null {
    const normalizedMessage: string = message.toLowerCase().replace(/\s+/g, " ").trim();
    if (normalizedMessage.includes("password reset code") && normalizedMessage.includes("sent")) {
      return "FORGOT_PASSWORD_GENERIC_SUCCESS";
    }
    return null;
  }

  private _resolveRequestCodeError(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 400) {
      return this._translateService.instant("FORGOT_PASSWORD_VALIDATION_ERROR");
    }
    return this._translateService.instant("FORGOT_PASSWORD_REQUEST_FAILED");
  }

  private _resolveResetError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        return this._translateService.instant("FORGOT_PASSWORD_RESET_INVALID");
      }
      if (error.status === 410) {
        return this._translateService.instant("FORGOT_PASSWORD_RESET_EXPIRED");
      }
    }
    return this._translateService.instant("FORGOT_PASSWORD_RESET_FAILED");
  }

  private _startResendCooldown(seconds: number = 120): void {
    this.resendCooldownSeconds.set(seconds);
    this._clearResendTimer();

    this._resendTimerId = setInterval(() => {
      const nextValue: number = this.resendCooldownSeconds() - 1;
      if (nextValue <= 0) {
        this.resendCooldownSeconds.set(0);
        this._clearResendTimer();
        return;
      }

      this.resendCooldownSeconds.set(nextValue);
    }, 1000);
  }

  private _clearResendTimer(): void {
    if (!this._resendTimerId) {
      return;
    }
    clearInterval(this._resendTimerId);
    this._resendTimerId = null;
  }

  private _formatCooldown(totalSeconds: number): string {
    const minutes: string = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds: string = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
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
