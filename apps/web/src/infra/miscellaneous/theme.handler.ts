import {Injectable} from "@angular/core";
import {EThemeApplication} from "../../interface/enums/EThemeApplication";

export interface IThemeHandler {
  setTheme(theme: EThemeApplication): void;

  getTheme(): EThemeApplication;
}

@Injectable({providedIn: "root"})
export class ThemeHandler {
  private readonly defaultTheme: EThemeApplication = EThemeApplication.DARK;
  private _theme: EThemeApplication = this.defaultTheme;

  public setTheme(theme: EThemeApplication): void {
    this._apply(theme);
  }

  public getTheme(): EThemeApplication {
    return this._theme;
  }

  private _apply(theme: EThemeApplication): void {
    this._theme = theme;
    document.documentElement.dataset["theme"] = theme;
  }
}
