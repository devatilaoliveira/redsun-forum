import {HttpErrorResponse} from "@angular/common/http";
import {Component, OnInit, inject, signal, WritableSignal} from "@angular/core";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {finalize} from "rxjs";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {MeResponseDTO} from "../../../../interface/dtos/user/MeResponseDTO";
import {ELanguage} from "../../../../interface/enums/ELanguage";
import {EVariant} from "../../../../interface/enums/EVariant";
import {ILocalStoreService, LocalStoreService} from "../../../../services/local-store.service";
import {IUserProfileService, UserProfileService} from "../../../../services/user-profile.service";
import {AppSettingsService, IAppSettingsService} from "../../../../services/app-settings.service";
import {RedsunTitle} from "../../../shared/fragments/redsunTitle/redsun.title";
import {RsButton} from "../../../shared/fragments/rsButton/rs.button";
import {RsCheckbox} from "../../../shared/fragments/rsCheckbox/rs.checkbox";
import {RsOptionsMenu, RsOptionsMenuOption} from "../../../shared/fragments/rsOptionsMenu/rs.options-menu";
import {PublicLegalFooterComponent} from "../../../shared/ui/public-legal-footer/public-legal-footer.component";

@Component({
  selector: "rs-legal-acceptance",
  standalone: true,
  imports: [RouterLink, TranslatePipe, RedsunTitle, RsButton, RsCheckbox, RsOptionsMenu, PublicLegalFooterComponent],
  templateUrl: "./legal-acceptance.view.html",
  styleUrl: "./legal-acceptance.view.scss"
})
export class LegalAcceptanceView implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _localStoreService: ILocalStoreService = inject(LocalStoreService);
  private readonly _userProfileService: IUserProfileService = inject(UserProfileService);
  private readonly _appSettingsService: IAppSettingsService = inject(AppSettingsService);

  protected readonly EVariant = EVariant;
  protected readonly ELanguage = ELanguage;
  protected readonly termsRoute: string = `/${ROUTE_PATHS.terms}`;
  protected readonly privacyRoute: string = `/${ROUTE_PATHS.privacy}`;
  protected readonly selectedLanguage = this._appSettingsService.language;
  protected readonly acceptedTerms: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly acknowledgedPrivacy: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly inProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly loadingProfile: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly errorMessage: WritableSignal<string | null> = signal<string | null>(null);
  ngOnInit(): void {
    const storedUser: MeResponseDTO | null = this._localStoreService.getAuthenticatedUser();
    if (storedUser) {
      this._appSettingsService.applyUserSettings(storedUser.userSettings);
      this._setUser(storedUser);
      this._redirectIfCurrent(storedUser);
      return;
    }

    this.loadingProfile.set(true);
    this._userProfileService.upsertCurrentUser().pipe(
      finalize(() => this.loadingProfile.set(false))
    ).subscribe({
      next: (user: MeResponseDTO) => {
        this._localStoreService.storeUser(user);
        this._appSettingsService.applyUserSettings(user.userSettings);
        this._setUser(user);
        this._redirectIfCurrent(user);
      },
      error: () => {
        this.errorMessage.set("LEGAL_ACCEPTANCE_LOAD_FAILED");
      }
    });
  }

  protected onAcceptedTermsChange(acceptedTerms: boolean): void {
    this.acceptedTerms.set(acceptedTerms);
    this.errorMessage.set(null);
  }

  protected onAcknowledgedPrivacyChange(acknowledgedPrivacy: boolean): void {
    this.acknowledgedPrivacy.set(acknowledgedPrivacy);
    this.errorMessage.set(null);
  }

  protected onAccept(): void {
    if (!this.acceptedTerms() || !this.acknowledgedPrivacy() || this.inProgress()) {
      this.errorMessage.set("LEGAL_ACCEPTANCE_REQUIRED");
      return;
    }

    this.errorMessage.set(null);
    this.inProgress.set(true);
    this._userProfileService.acknowledgeLegalDocuments({
      acceptedTerms: true,
      acknowledgedPrivacy: true
    }).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: (user: MeResponseDTO) => {
        this._localStoreService.storeUser(user);
        this._appSettingsService.applyUserSettings(user.userSettings);
        this._setUser(user);
        void this._router.navigateByUrl(this._getReturnUrl(), {replaceUrl: true});
      },
      error: (error: unknown) => {
        this.errorMessage.set(this._resolveAcceptanceError(error));
      }
    });
  }

  protected onLangChange(option: RsOptionsMenuOption): void {
    if (!Object.values(ELanguage).includes(option.value as ELanguage)) return;

    const nextLang = option.value as ELanguage;
    this._appSettingsService.setTransientLanguage(nextLang).subscribe();
  }

  private _setUser(user: MeResponseDTO): void {
    this.acceptedTerms.set(user.legalAcknowledgement.termsAccepted);
    this.acknowledgedPrivacy.set(user.legalAcknowledgement.privacyAcknowledged);
  }

  private _redirectIfCurrent(user: MeResponseDTO): void {
    if (user.legalAcknowledgement.current) {
      void this._router.navigateByUrl(this._getReturnUrl(), {replaceUrl: true});
    }
  }

  private _getReturnUrl(): string {
    const returnUrl: string | null = this._route.snapshot.queryParamMap.get("returnUrl");
    if (!returnUrl || !returnUrl.startsWith("/") || returnUrl.startsWith("//") || returnUrl === `/${ROUTE_PATHS.legalAcceptance}`) {
      return "/";
    }

    return returnUrl;
  }

  private _resolveAcceptanceError(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 400) {
      return "LEGAL_ACCEPTANCE_REQUIRED";
    }
    return "LEGAL_ACCEPTANCE_FAILED";
  }
}
