import {Component, inject} from "@angular/core";
import {CdkVirtualScrollableElement} from "@angular/cdk/scrolling";
import {RouterOutlet} from "@angular/router";
import {ITranslateService, TranslateModule, TranslateService} from "@ngx-translate/core";
import {ELanguage} from "../interface/enums/ELanguage";
import {AppSettingsService} from "../services/app-settings.service";
import {RsTopBarNavigatorComponent} from "./shared/ui/top-bar-navigator/top-bar-navigator.component";
import {RsToastHostComponent} from "./shared/ui/toast/toast-host.component";

@Component({
  selector: "app-root",
  imports: [
    CdkVirtualScrollableElement,
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

  constructor() {
    this._translate.addLangs(Object.values(ELanguage).map(AppSettingsService.toTranslateLang));
    this._translate.setFallbackLang(AppSettingsService.toTranslateLang(ELanguage.PT));
  }
}
