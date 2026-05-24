import {inject, Injectable} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {RouterStateSnapshot, TitleStrategy} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";

@Injectable({providedIn: "root"})
export class TitleI18nHandler extends TitleStrategy {
  private readonly _translate: TranslateService = inject(TranslateService);
  private readonly _title: Title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const rawTitle: string | undefined = this.buildTitle(snapshot);
    const rsTranslated: string = this._translate.instant("RS");

    if (!rawTitle) {
      this._title.setTitle(rsTranslated);
      return;
    }

    const translated: string = this._translate.instant(rawTitle);
    const finalTitle = `${rsTranslated} - ${translated || rawTitle}`;
    this._title.setTitle(finalTitle);
  }
}
