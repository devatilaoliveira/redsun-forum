import {Component, inject, signal, WritableSignal} from "@angular/core";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {finalize, from} from "rxjs";
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {EVariant} from "../../../interface/enums/EVariant";
import {ISupabaseAuthClient, SupabaseAuthClientAdapter} from "../../../services/supabase-auth-client.adapter";
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
export class ForgotPasswordView {
  private readonly _router: Router = inject(Router);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _supabaseAuthClient: ISupabaseAuthClient = inject(SupabaseAuthClientAdapter);

  protected readonly resetLinkRequested: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly inProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly submittedEmail: WritableSignal<string> = signal<string>("");
  protected readonly email: WritableSignal<string> = signal<string>("");
  protected readonly infoMessage: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);

  protected readonly emailPattern: RegExp = EMAIL_PATTERN;
  protected readonly EVariant = EVariant;

  protected onEmailChange(value: string): void {
    this.email.set(value);
    this.errorMessage.set(null);
  }

  protected onRequestResetLink(event?: Event): void {
    event?.preventDefault();
    if (this.inProgress()) {
      return;
    }

    const normalizedEmail: string = this.email().trim();
    if (!this.emailPattern.test(normalizedEmail)) {
      this.errorMessage.set(this._translateService.instant("FORGOT_PASSWORD_VALIDATION_ERROR"));
      return;
    }

    this.errorMessage.set(null);
    this.inProgress.set(true);
    from(this._supabaseAuthClient.resetPasswordForEmail({
      email: normalizedEmail,
      redirectTo: `${environment.baseUrl}/${ROUTE_PATHS.changePassword}`
    })).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: () => {
        this.resetLinkRequested.set(true);
        this.submittedEmail.set(normalizedEmail);
        this.infoMessage.set(this._translateService.instant("FORGOT_PASSWORD_GENERIC_SUCCESS"));
      },
      error: () => {
        this.errorMessage.set(this._translateService.instant("FORGOT_PASSWORD_REQUEST_FAILED"));
      }
    });
  }

  protected onUseAnotherEmail(): void {
    this.resetLinkRequested.set(false);
    this.submittedEmail.set("");
    this.email.set("");
    this.infoMessage.set(null);
    this.errorMessage.set(null);
  }

  protected onBackToLogin(): void {
    void this._router.navigate(["/", ROUTE_PATHS.login]);
  }
}
