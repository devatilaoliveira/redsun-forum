import {Component, inject, signal, WritableSignal} from "@angular/core";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {finalize, from} from "rxjs";
import {environment} from "../../../environments/environment";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {EVariant} from "../../../interface/enums/EVariant";
import {ISupabaseAuthClient, SupabaseAuthClientAdapter} from "../../../services/supabase-auth-client.adapter";
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
export class RegisterView {
  private readonly _fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly _router: Router = inject(Router);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _supabaseAuthClient: ISupabaseAuthClient = inject(SupabaseAuthClientAdapter);

  protected readonly registerForm: RegisterFormGroup = this._fb.group({
    email: this._fb.control("", {validators: [Validators.required, Validators.email, Validators.maxLength(254)]}),
    password: this._fb.control("", {validators: [Validators.required, Validators.minLength(8), Validators.maxLength(100)]}),
    confirmPassword: this._fb.control("", {validators: [Validators.required, Validators.minLength(8), Validators.maxLength(100)]}),
    acceptedLegal: this._fb.control(false, {validators: [Validators.requiredTrue]})
  });
  protected readonly registerFormControls = this.registerForm.controls;
  protected readonly registrationSubmitted: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly inProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly submittedEmail: WritableSignal<string> = signal<string>("");
  protected readonly infoMessage: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);

  protected readonly emailPattern: RegExp = EMAIL_PATTERN;
  protected readonly passwordPattern: RegExp = /^.{8,100}$/;
  protected readonly EVariant = EVariant;
  protected readonly termsRoute: string = `/${ROUTE_PATHS.terms}`;
  protected readonly privacyRoute: string = `/${ROUTE_PATHS.privacy}`;

  protected onEmailChange(value: string): void {
    this.registerFormControls.email.setValue(value);
    this.registerFormControls.email.markAsDirty();
    this.errorMessage.set(null);
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

  protected onSubmit(event?: Event): void {
    event?.preventDefault();
    this.registerForm.markAllAsTouched();
    this.errorMessage.set(null);

    if (this.registerForm.invalid || this.inProgress()) {
      return;
    }

    if (this.registerFormControls.password.value !== this.registerFormControls.confirmPassword.value) {
      this.errorMessage.set(this._translateService.instant("PASSWORDS_DO_NOT_MATCH"));
      return;
    }

    const email: string = this.registerFormControls.email.value.trim();

    this.inProgress.set(true);
    from(this._supabaseAuthClient.signUp({
      email,
      password: this.registerFormControls.password.value,
      emailRedirectTo: `${environment.baseUrl}/${ROUTE_PATHS.authVerified}`
    })).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: () => {
        this.registrationSubmitted.set(true);
        this.submittedEmail.set(email);
        this.registerFormControls.password.setValue("");
        this.registerFormControls.confirmPassword.setValue("");
        this.errorMessage.set(null);
        this.infoMessage.set(this._translateService.instant("REGISTER_GENERIC_SUCCESS"));
      },
      error: (error: unknown) => {
        this.errorMessage.set(this._resolveRegisterError(error));
      }
    });
  }

  protected onEditEmail(): void {
    this.registrationSubmitted.set(false);
    this.infoMessage.set(null);
    this.errorMessage.set(null);
    this.submittedEmail.set("");
  }

  protected onBackToLogin(): void {
    void this._router.navigate(["/", ROUTE_PATHS.login]);
  }

  private _resolveRegisterError(error: unknown): string {
    const message: string = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    if (message.includes("password")) {
      return this._translateService.instant("REGISTER_VALIDATION_ERROR");
    }

    return this._translateService.instant("REGISTER_FAILED");
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
