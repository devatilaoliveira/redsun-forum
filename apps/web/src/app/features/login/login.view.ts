import {Component, DestroyRef, OnInit, inject, WritableSignal, signal} from "@angular/core";
import {from, fromEvent, finalize, switchMap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Router} from "@angular/router";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {environment} from "../../../environments/environment";
import {IOAuthResult} from "../../../interface/models/ioauth-result-message";
import {ILocalStoreService, LocalStoreService} from "../../../services/local-store.service";
import {RedsunTitle} from "../../shared/fragments/redsunTitle/redsun.title";
import {NgOptimizedImage} from "@angular/common";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {EVariant} from "../../../interface/enums/EVariant";
import {IAuthService, AuthService} from "../../../services/auth.service";
import {MeResponseDTO} from "../../../interface/dtos/user/MeResponseDTO";
import {RsButtonText} from "../../shared/fragments/rsButtonText/rs.button-text";
import {EMAIL_PATTERN} from "../../../interface/constants/pattern-validators";
import {PublicLegalFooterComponent} from "../../shared/ui/public-legal-footer/public-legal-footer.component";
import {ISupabaseAuthClient, SupabaseAuthClientAdapter} from "../../../services/supabase-auth-client.adapter";
import {GoogleButton} from "../../shared/fragments/googleButton/google.button";

@Component({
  selector: "rs-login",
  standalone: true,
  imports: [RedsunTitle, NgOptimizedImage, TranslatePipe, RsInput, RsButton, RsButtonText, PublicLegalFooterComponent, GoogleButton],
  templateUrl: "./login.view.html",
  styleUrl: "./login.view.scss"
})
export class LoginView implements OnInit {
  protected readonly emailPattern: RegExp = EMAIL_PATTERN;
  private readonly _router: Router = inject(Router);
  private readonly _localStoreService: ILocalStoreService = inject(LocalStoreService);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _authService: IAuthService = inject(AuthService);
  private readonly _supabaseAuthClient: ISupabaseAuthClient = inject(SupabaseAuthClientAdapter);
  protected errorMessage: WritableSignal<string | null> = signal<string | null>(null);
  protected inProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected email: string = "";
  protected password: string = "";
  protected readonly EVariant = EVariant;
  protected readonly forgotPasswordRoute: string = `/${ROUTE_PATHS.forgotPassword}`;
  protected readonly registerRoute: string = `/${ROUTE_PATHS.register}`;
  private readonly _targetOrigin: string = new URL(environment.baseUrl).origin;
  private readonly _onOAuthMessage = (event: MessageEvent<IOAuthResult>): void => {
    if (event.origin !== this._targetOrigin) return;

    if (event.data.user) {
      this._localStoreService.storeUser(event.data.user);
      this.errorMessage.set(null);
      void this._router.navigate(["/"], {replaceUrl: true});
      return;
    }

    this._localStoreService.removeUser();
    this.errorMessage.set(event.data.message!);
  };

  ngOnInit(): void {
    if (typeof window !== "undefined") {
      fromEvent<MessageEvent<IOAuthResult>>(window, "message")
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(this._onOAuthMessage);
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
        this._localStoreService.storeUser(me);
        void this._router.navigate(["/"], {replaceUrl: true});
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
