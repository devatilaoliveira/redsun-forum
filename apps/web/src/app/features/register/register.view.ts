import {HttpErrorResponse} from "@angular/common/http";
import {Component, computed, inject, OnDestroy, Signal, signal, WritableSignal} from "@angular/core";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {finalize} from "rxjs";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {EVariant} from "../../../interface/enums/EVariant";
import {RegistrationRequestDTO} from "../../../interface/dtos/auth/RegistrationRequestDTO";
import {VerifyEmailCodeRequestDTO} from "../../../interface/dtos/auth/VerifyEmailCodeRequestDTO";
import {IEmailAuthService, EmailAuthService} from "../../../services/email-auth.service";
import {RedsunTitle} from "../../shared/fragments/redsunTitle/redsun.title";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsCheckbox} from "../../shared/fragments/rsCheckbox/rs.checkbox";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {EMAIL_PATTERN} from "../../../interface/constants/pattern-validators";
import {PublicLegalFooterComponent} from "../../shared/ui/public-legal-footer/public-legal-footer.component";

type RegisterFormGroup = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  acceptedLegal: FormControl<boolean>;
}>;

@Component({
  selector: "rs-register",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, RedsunTitle, RsButton, RsCheckbox, RsInput, PublicLegalFooterComponent],
  templateUrl: "./register.view.html",
  styleUrl: "./register.view.scss"
})
export class RegisterView implements OnDestroy {
  private readonly _fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly _router: Router = inject(Router);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _emailAuthService: IEmailAuthService = inject(EmailAuthService);
  private _resendTimerId: ReturnType<typeof setInterval> | null = null;

  protected readonly registerForm: RegisterFormGroup = this._fb.group({
    email: this._fb.control("", {validators: [Validators.required, Validators.email, Validators.maxLength(254)]}),
    password: this._fb.control("", {validators: [Validators.required, Validators.minLength(8), Validators.maxLength(100)]}),
    confirmPassword: this._fb.control("", {validators: [Validators.required, Validators.minLength(8), Validators.maxLength(100)]}),
    acceptedLegal: this._fb.control(false, {validators: [Validators.requiredTrue]})
  });
  protected readonly registerFormControls = this.registerForm.controls;
  protected readonly registrationSubmitted: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly inProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly verifyInProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly resendInProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly submittedEmail: WritableSignal<string> = signal<string>("");
  protected readonly verificationCode: WritableSignal<string> = signal<string>("");
  protected readonly infoMessage: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly resendCooldownSeconds: WritableSignal<number> = signal<number>(0);
  protected readonly canResend: Signal<boolean> = computed<boolean>(() =>
    this.registrationSubmitted()
      && this.resendCooldownSeconds() === 0
      && !this.inProgress()
      && !this.resendInProgress()
      && !this.verifyInProgress()
  );
  protected readonly canVerify: Signal<boolean> = computed<boolean>(() =>
    this.registrationSubmitted()
      && this.verificationCodePattern.test(this.verificationCode().trim())
      && !this.inProgress()
      && !this.verifyInProgress()
      && !this.resendInProgress()
  );

  protected readonly emailPattern: RegExp = EMAIL_PATTERN;
  protected readonly passwordPattern: RegExp = /^.{8,100}$/;
  protected readonly verificationCodePattern: RegExp = /^\d{6}$/;
  protected readonly EVariant = EVariant;
  protected readonly termsRoute: string = `/${ROUTE_PATHS.terms}`;
  protected readonly privacyRoute: string = `/${ROUTE_PATHS.privacy}`;

  protected onEmailChange(value: string): void {
    this.registerFormControls.email.setValue(value);
    this.registerFormControls.email.markAsDirty();
  }

  protected onPasswordChange(value: string): void {
    this.registerFormControls.password.setValue(value);
    this.registerFormControls.password.markAsDirty();
    this.errorMessage.set(null);
  }

  protected onConfirmPasswordChange(value: string): void {
    this.registerFormControls.confirmPassword.setValue(value);
    this.registerFormControls.confirmPassword.markAsDirty();
    this.errorMessage.set(null);
  }

  protected onAcceptedLegalChange(acceptedLegal: boolean): void {
    this.registerFormControls.acceptedLegal.setValue(acceptedLegal);
    this.registerFormControls.acceptedLegal.markAsDirty();
    this.registerFormControls.acceptedLegal.markAsTouched();
    this.errorMessage.set(null);
  }

  protected onVerificationCodeChange(value: string): void {
    this.verificationCode.set(value);
    this.errorMessage.set(null);
  }

  protected onSubmit(event?: Event): void {
    event?.preventDefault();
    this.registerForm.markAllAsTouched();
    this.errorMessage.set(null);

    if (this.registerForm.invalid || this.inProgress()) {
      return;
    }

    const payload: RegistrationRequestDTO = {
      email: this.registerFormControls.email.value.trim(),
      password: this.registerFormControls.password.value,
      acceptedTerms: true,
      acknowledgedPrivacy: true
    };

    this.inProgress.set(true);
    this._emailAuthService.register(payload).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: (message: string) => {
        this.registrationSubmitted.set(true);
        this.submittedEmail.set(payload.email);
        this.verificationCode.set("");
        this.registerFormControls.confirmPassword.setValue("");
        this.errorMessage.set(null);
        this.infoMessage.set(this._resolveMessage(message, "REGISTER_GENERIC_SUCCESS"));
      },
      error: (error: unknown) => {
        this.errorMessage.set(this._resolveRegisterError(error));
      }
    });
  }

  protected onVerifyCode(): void {
    if (!this.canVerify()) {
      this.errorMessage.set(this._translateService.instant("VERIFY_CODE_VALIDATION_ERROR"));
      return;
    }

    const email: string = this.submittedEmail().trim();
    const code: string = this.verificationCode().trim();
    if (!email || !code) {
      this.errorMessage.set(this._translateService.instant("VERIFY_CODE_VALIDATION_ERROR"));
      return;
    }

    const payload: VerifyEmailCodeRequestDTO = {email, code};

    this.errorMessage.set(null);
    this.verifyInProgress.set(true);
    this._emailAuthService.verifyEmailCode(payload).pipe(
      finalize(() => this.verifyInProgress.set(false))
    ).subscribe({
      next: () => {
        this.verificationCode.set("");
        void this._router.navigate([`/${ROUTE_PATHS.authVerified}`], {replaceUrl: true});
      },
      error: (error: unknown) => {
        this.errorMessage.set(this._resolveVerifyCodeError(error));
      }
    });
  }

  protected onResendVerification(): void {
    if (!this.canResend()) {
      return;
    }

    const email: string = this.submittedEmail().trim();
    if (!email) {
      this.errorMessage.set(this._translateService.instant("RESEND_FAILED"));
      return;
    }

    this.errorMessage.set(null);
    this.resendInProgress.set(true);
    this._emailAuthService.resendVerification({email}).pipe(
      finalize(() => this.resendInProgress.set(false))
    ).subscribe({
      next: (message: string) => {
        this.infoMessage.set(this._resolveMessage(message, "RESEND_GENERIC_SUCCESS"));
        this._startResendCooldown();
      },
      error: (error: unknown) => {
        this.errorMessage.set(this._resolveResendError(error));
      }
    });
  }

  protected onEditEmail(): void {
    this.registrationSubmitted.set(false);
    this.infoMessage.set(null);
    this.errorMessage.set(null);
    this.submittedEmail.set("");
    this.verificationCode.set("");
    this.resendCooldownSeconds.set(0);
    this._clearResendTimer();
  }

  protected onBackToLogin(): void {
    void this._router.navigate(["/", ROUTE_PATHS.login]);
  }

  protected getResendButtonText(): string {
    const cooldown: number = this.resendCooldownSeconds();
    if (cooldown <= 0) {
      return this._translateService.instant("RESEND_VERIFICATION");
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

    if (normalizedMessage.includes("verification code") && normalizedMessage.includes("resend")) {
      return "RESEND_GENERIC_SUCCESS";
    }
    if (normalizedMessage.includes("verification code") && normalizedMessage.includes("sent")) {
      return "REGISTER_GENERIC_SUCCESS";
    }
    if (normalizedMessage.includes("eligible") && normalizedMessage.includes("verification code")) {
      return "REGISTER_GENERIC_SUCCESS";
    }

    return null;
  }

  private _resolveRegisterError(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 400) {
      return this._translateService.instant("REGISTER_VALIDATION_ERROR");
    }
    return this._translateService.instant("REGISTER_FAILED");
  }

  private _resolveVerifyCodeError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        return this._translateService.instant("VERIFY_CODE_INVALID");
      }
      if (error.status === 410) {
        return this._translateService.instant("VERIFY_CODE_EXPIRED");
      }
    }
    return this._translateService.instant("VERIFY_CODE_FAILED");
  }

  private _resolveResendError(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 400) {
      return this._translateService.instant("RESEND_VALIDATION_ERROR");
    }
    return this._translateService.instant("RESEND_FAILED");
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
    const password: string = this.registerFormControls.password.value;
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
