import {Component, inject} from "@angular/core";
import {RouterOutlet} from "@angular/router";
import {ITranslateService, TranslateModule, TranslateService} from "@ngx-translate/core";
import {ELanguage} from "../interface/enums/ELanguage";
import {ILocalStoreService, LocalStoreService} from "../services/local-store.service";
import {IThemeHandler, ThemeHandler} from "../infra/miscellaneous/theme.handler";
import {RsTopBarNavigatorComponent} from "./shared/ui/top-bar-navigator/top-bar-navigator.component";
import {RsToastHostComponent} from "./shared/ui/toast/toast-host.component";

@Component({
  selector: "app-root",
  imports: [
    RouterOutlet,
    TranslateModule,
    RsTopBarNavigatorComponent,
    RsToastHostComponent
  ],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
  standalone: true
})
export class App {
  private readonly _translate: ITranslateService = inject(TranslateService);
  private readonly _LocalStoreService: ILocalStoreService = inject(LocalStoreService);
  private readonly _themeHandler: IThemeHandler = inject(ThemeHandler);

  constructor() {
    this._translate.addLangs(Object.values(ELanguage));
    this._translate.setFallbackLang(ELanguage.PT);

    this._translate.use(this._LocalStoreService.getLanguage());
    this._themeHandler.init()
  }
}
