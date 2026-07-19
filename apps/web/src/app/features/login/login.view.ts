import {Component, OnInit, inject, WritableSignal, signal} from "@angular/core";
import {from, finalize, switchMap} from "rxjs";
import {Router} from "@angular/router";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {IAuthCallbackState} from "../../../interface/models/iauth-callback-state";
import {RedsunTitle} from "../../shared/fragments/redsunTitle/redsun.title";
import {NgOptimizedImage} from "@angular/common";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {EVariant} from "../../../interface/enums/EVariant";
import {IAuthService, AuthService} from "../../../services/auth.service";
import {RsButtonText} from "../../shared/fragments/rsButtonText/rs.button-text";
import {EMAIL_PATTERN} from "../../../interface/constants/pattern-validators";
import {PublicLegalFooterComponent} from "../../shared/ui/public-legal-footer/public-legal-footer.component";
import {ISupabaseAuthClient, SupabaseAuthClientAdapter} from "../../../services/supabase-auth-client.adapter";
import {GoogleButton} from "../../shared/fragments/googleButton/google.button";
import {ELanguage} from "../../../interface/enums/ELanguage";
import {RsOptionsMenu, RsOptionsMenuOption} from "../../shared/fragments/rsOptionsMenu/rs.options-menu";
import {AppSettingsService, IAppSettingsService} from "../../../services/app-settings.service";
import {MeResponseDTO} from "../../../interface/dtos/user/MeResponseDTO";
import {resolvePreferredHomeUrl} from "../../../infra/miscellaneous/preferred-home.functions";

@Component({
  selector: "rs-login",
  standalone: true,
  imports: [RedsunTitle, NgOptimizedImage, TranslatePipe, RsInput, RsButton, RsButtonText, PublicLegalFooterComponent, GoogleButton, RsOptionsMenu],
  templateUrl: "./login.view.html",
  styleUrl: "./login.view.scss"
})
export class LoginView implements OnInit {
  protected readonly emailPattern: RegExp = EMAIL_PATTERN;
  private readonly _router: Router = inject(Router);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _authService: IAuthService = inject(AuthService);
  private readonly _supabaseAuthClient: ISupabaseAuthClient = inject(SupabaseAuthClientAdapter);
  private readonly _appSettingsService: IAppSettingsService = inject(AppSettingsService);
  protected errorMessage: WritableSignal<string | null> = signal<string | null>(null);
  protected inProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly selectedLanguage = this._appSettingsService.language;
  protected email: string = "";
  protected password: string = "";
  protected readonly EVariant = EVariant;
  protected readonly ELanguage = ELanguage;
  protected readonly forgotPasswordRoute: string = `/${ROUTE_PATHS.forgotPassword}`;
  protected readonly registerRoute: string = `/${ROUTE_PATHS.register}`;

  ngOnInit(): void {
    const state = history.state as Partial<IAuthCallbackState> | undefined;
    const messageParts: string[] = [state?.authError, state?.authErrorCode].filter((value: string | undefined): value is string => Boolean(value));

    if (messageParts.length) {
      this.errorMessage.set(messageParts.join(" "));
    }
  }

  protected onEmailLogin(event?: Event): void {
    event?.preventDefault();
    if (this.inProgress()) {
      return;
    }

    const email: string = this.email.trim();

    if (!this.emailPattern.test(email) || !this.password) {
      this.errorMessage.set(this._translateService.instant("LOGIN_VALIDATION_ERROR"));
      return;
    }

    this.errorMessage.set(null);
    this.inProgress.set(true);
    from(this._supabaseAuthClient.signInWithPassword({email, password: this.password})).pipe(
      switchMap(() => this._authService.completeSignIn()),
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: (me: MeResponseDTO) => {
        void this._router.navigateByUrl(
          resolvePreferredHomeUrl(
            me.userSettings.redirectToFavorite,
            me.userSettings.favoriteTaleId
          ),
          {replaceUrl: true}
        );
      },
      error: (error: unknown) => {
        void this._authService.logout();
        this.errorMessage.set(this._resolveLoginError(error));
      }
    });
  }

  protected onEmailChange(value: string): void {
    this.email = value;
  }

  protected onPasswordChange(value: string): void {
    this.password = value;
  }

  protected onLangChange(option: RsOptionsMenuOption): void {
    if (!Object.values(ELanguage).includes(option.value as ELanguage)) return;

    const nextLang = option.value as ELanguage;
    this._appSettingsService.setTransientLanguage(nextLang).subscribe();
  }

  private _resolveLoginError(error: unknown): string {
    const message: string = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    if (message.includes("email not confirmed")) {
      return this._translateService.instant("LOGIN_EMAIL_NOT_CONFIRMED");
    }

    if (message.includes("invalid login credentials")) {
      return this._translateService.instant("LOGIN_INVALID_CREDENTIALS");
    }

    return this._translateService.instant("LOGIN_FAILED");
  }
}
