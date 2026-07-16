import {Injectable, Signal, WritableSignal, inject, signal} from "@angular/core";
import {InterpolatableTranslation, TranslateService} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {IThemeHandler, ThemeHandler} from "../infra/miscellaneous/theme.handler";
import {UserSettingsDTO} from "../interface/dtos/user/UserSettingsDTO";
import {ELanguage} from "../interface/enums/ELanguage";
import {EThemeApplication} from "../interface/enums/EThemeApplication";

export interface IAppSettingsService {
  readonly language: Signal<ELanguage>;
  readonly theme: Signal<EThemeApplication>;
  readonly redirectToFavorite: Signal<boolean>;

  initDefaults(settings?: UserSettingsDTO): Observable<InterpolatableTranslation>;
  applyUserSettings(settings: UserSettingsDTO): void;
  resetToDetectedDefaults(): void;
  setTransientLanguage(language: ELanguage): Observable<InterpolatableTranslation>;
  getLanguage(): ELanguage;
}

@Injectable({providedIn: "root"})
export class AppSettingsService implements IAppSettingsService {
  private readonly _translate: TranslateService = inject(TranslateService);
  private readonly _themeHandler: IThemeHandler = inject(ThemeHandler);
  private readonly _language: WritableSignal<ELanguage> = signal<ELanguage>(this._detectLanguage());
  private readonly _theme: WritableSignal<EThemeApplication> = signal<EThemeApplication>(this._detectTheme());
  private readonly _redirectToFavorite: WritableSignal<boolean> = signal<boolean>(false);

  readonly language: Signal<ELanguage> = this._language.asReadonly();
  readonly theme: Signal<EThemeApplication> = this._theme.asReadonly();
  readonly redirectToFavorite: Signal<boolean> = this._redirectToFavorite.asReadonly();

  public static toTranslateLang(language: ELanguage): string {
    return language.toLowerCase();
  }

  public initDefaults(settings?: UserSettingsDTO): Observable<InterpolatableTranslation> {
    const language: ELanguage = this._toLanguage(settings?.appLanguage) ?? this._language();
    const theme: EThemeApplication = this._toTheme(settings?.appTheme) ?? this._theme();
    const redirectToFavorite: boolean = settings?.redirectToFavorite ?? false;

    this._language.set(language);
    this._theme.set(theme);
    this._redirectToFavorite.set(redirectToFavorite);
    this._themeHandler.setTheme(this._theme());
    return this._translate.use(AppSettingsService.toTranslateLang(this._language()));
  }

  public applyUserSettings(settings: UserSettingsDTO): void {
    this._language.set(settings.appLanguage);
    this._theme.set(settings.appTheme);
    this._redirectToFavorite.set(settings.redirectToFavorite);
    this._themeHandler.setTheme(settings.appTheme);
    this._translate.use(AppSettingsService.toTranslateLang(settings.appLanguage)).subscribe();
  }

  public resetToDetectedDefaults(): void {
    const language: ELanguage = this._detectLanguage();
    const theme: EThemeApplication = this._detectTheme();

    this._language.set(language);
    this._theme.set(theme);
    this._redirectToFavorite.set(false);
    this._themeHandler.setTheme(theme);
    this._translate.use(AppSettingsService.toTranslateLang(language)).subscribe();
  }

  public setTransientLanguage(language: ELanguage): Observable<InterpolatableTranslation> {
    this._language.set(language);
    return this._translate.use(AppSettingsService.toTranslateLang(language));
  }

  public getLanguage(): ELanguage {
    return this._language();
  }

  private _detectLanguage(): ELanguage {
    const browserLanguages: readonly string[] = typeof navigator === "undefined"
      ? []
      : navigator.languages?.length
        ? navigator.languages
        : [navigator.language];

    for (const browserLanguage of browserLanguages) {
      const normalized: string = browserLanguage.toLowerCase();
      if (normalized.startsWith("en")) return ELanguage.EN;
      if (normalized.startsWith("de")) return ELanguage.DE;
      if (normalized.startsWith("pt")) return ELanguage.PT;
    }

    return ELanguage.PT;
  }

  private _detectTheme(): EThemeApplication {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches) {
      return EThemeApplication.LIGHT;
    }

    return EThemeApplication.DARK;
  }

  private _toLanguage(value: ELanguage | null | undefined): ELanguage | null {
    return value && Object.values(ELanguage).includes(value) ? value : null;
  }

  private _toTheme(value: EThemeApplication | null | undefined): EThemeApplication | null {
    return value && Object.values(EThemeApplication).includes(value) ? value : null;
  }
}
