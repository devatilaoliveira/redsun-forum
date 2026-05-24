import {Component, inject, signal, WritableSignal} from "@angular/core";
import {ILocalStoreService, LocalStoreService} from "../../../services/local-store.service";
import {ELanguage} from "../../../interface/enums/ELanguage";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FormsModule} from "@angular/forms";
import {RsSelect} from "../../shared/fragments/rsSelect/rs.select";
import {EThemeApplication} from "../../../interface/enums/EThemeApplication";
import {IThemeHandler, ThemeHandler} from "../../../infra/miscellaneous/theme.handler";

@Component({
  selector: "rs-settings-my",
  standalone: true,
  imports: [FormsModule, RsSelect, TranslatePipe],
  templateUrl: "./settings-my.view.html",
  styleUrl: "./settings-my.view.scss"
})
export class SettingsMyView {
  private readonly _localStoreService: ILocalStoreService = inject(LocalStoreService);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _themeHandler: IThemeHandler = inject(ThemeHandler);
  protected readonly selectedLanguage: WritableSignal<ELanguage> = signal<ELanguage>(this._localStoreService.getLanguage());
  protected readonly selectedTheme: WritableSignal<EThemeApplication> = signal<EThemeApplication>(this._themeHandler.getTheme());
  protected readonly ELanguage = ELanguage;
  protected readonly EThemeApplication = EThemeApplication;

  onLangChange(lang: string | null): void {
    if (!lang || !Object.values(ELanguage).includes(lang as ELanguage)) return;

    const nextLang = lang as ELanguage;
    this.selectedLanguage.set(nextLang);
    this._localStoreService.setLanguage(nextLang);
    this._translateService.use(nextLang).subscribe();
  }

  onThemeChange(theme: string | null): void {
    if (!theme || !Object.values(EThemeApplication).includes(theme as EThemeApplication)) return;

    const nextTheme = theme as EThemeApplication;
    this.selectedTheme.set(nextTheme);
    this._themeHandler.setTheme(nextTheme);
  }
}
