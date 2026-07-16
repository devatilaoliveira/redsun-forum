import {Component, Signal, WritableSignal, inject, signal} from "@angular/core";
import {ELanguage} from "../../../interface/enums/ELanguage";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FormsModule} from "@angular/forms";
import {finalize} from "rxjs";
import {RsSelect} from "../../shared/fragments/rsSelect/rs.select";
import {EThemeApplication} from "../../../interface/enums/EThemeApplication";
import {AppSettingsService, IAppSettingsService} from "../../../services/app-settings.service";
import {IUserProfileService, UserProfileService} from "../../../services/user-profile.service";
import {ILocalStoreService, LocalStoreService} from "../../../services/local-store.service";
import {MeResponseDTO} from "../../../interface/dtos/user/MeResponseDTO";
import {IToastService, ToastService} from "../../../services/toast.service";
import {EVariant} from "../../../interface/enums/EVariant";
import {RsCheckbox} from "../../shared/fragments/rsCheckbox/rs.checkbox";

@Component({
  selector: "rs-settings-my",
  standalone: true,
  imports: [FormsModule, RsSelect, RsCheckbox, TranslatePipe],
  templateUrl: "./settings-my.view.html",
  styleUrl: "./settings-my.view.scss"
})
export class SettingsMyView {
  private readonly _localStoreService: ILocalStoreService = inject(LocalStoreService);
  private readonly _userProfileService: IUserProfileService = inject(UserProfileService);
  private readonly _appSettingsService: IAppSettingsService = inject(AppSettingsService);
  private readonly _toastService: IToastService = inject(ToastService);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  protected readonly selectedLanguage: Signal<ELanguage> = this._appSettingsService.language;
  protected readonly selectedTheme: Signal<EThemeApplication> = this._appSettingsService.theme;
  protected readonly redirectToFavorite: Signal<boolean> = this._appSettingsService.redirectToFavorite;
  protected readonly saveInProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly ELanguage = ELanguage;
  protected readonly EThemeApplication = EThemeApplication;

  onLangChange(lang: string | null): void {
    if (!lang || !Object.values(ELanguage).includes(lang as ELanguage) || this.saveInProgress()) return;

    const nextLang = lang as ELanguage;
    this.saveInProgress.set(true);
    this._userProfileService.updateMySettings({appLanguage: nextLang}).pipe(
      finalize(() => this.saveInProgress.set(false))
    ).subscribe({
      next: (user: MeResponseDTO) => this._applyUpdatedUser(user),
      error: () => this._showSaveFailedToast()
    });
  }

  onThemeChange(theme: string | null): void {
    if (!theme || !Object.values(EThemeApplication).includes(theme as EThemeApplication) || this.saveInProgress()) return;

    const nextTheme = theme as EThemeApplication;
    this.saveInProgress.set(true);
    this._userProfileService.updateMySettings({appTheme: nextTheme}).pipe(
      finalize(() => this.saveInProgress.set(false))
    ).subscribe({
      next: (user: MeResponseDTO) => this._applyUpdatedUser(user),
      error: () => this._showSaveFailedToast()
    });
  }

  onRedirectToFavoriteChange(redirectToFavorite: boolean): void {
    if (this.saveInProgress()) return;
    this.saveInProgress.set(true);
    this._userProfileService.updateMySettings({redirectToFavorite}).pipe(
      finalize(() => this.saveInProgress.set(false))
    ).subscribe({
      next: (user: MeResponseDTO) => this._applyUpdatedUser(user),
      error: () => this._showSaveFailedToast()
    });
  }

  private _applyUpdatedUser(user: MeResponseDTO): void {
    this._localStoreService.storeUser(user);
    this._appSettingsService.applyUserSettings(user.userSettings);
  }

  private _showSaveFailedToast(): void {
    this._toastService.show({
      label: this._translateService.instant("ERROR"),
      message: this._translateService.instant("SETTINGS_SAVE_FAILED"),
      variant: EVariant.DANGER
    });
  }
}
