import {Injectable} from "@angular/core";
import {EThemeApplication} from "../../interface/enums/EThemeApplication";
import {THEME_KEY} from "../../interface/constants/store.constants";

export interface IThemeHandler {
  init(): void;

  setTheme(theme: EThemeApplication): void;

  getTheme(): EThemeApplication;
}

@Injectable({providedIn: "root"})
export class ThemeHandler {
  private readonly defaultTheme: EThemeApplication = EThemeApplication.DARK;

  public init(): void {
    const saved: EThemeApplication = (localStorage.getItem(THEME_KEY) as EThemeApplication) || this.defaultTheme;
    this._apply(saved);
  }

  public setTheme(theme: EThemeApplication): void {
    this._apply(theme);
  }

  public getTheme(): EThemeApplication {
    return (localStorage.getItem(THEME_KEY) as EThemeApplication) || this.defaultTheme;
  }

  private _apply(theme: EThemeApplication): void {
    document.documentElement.dataset["theme"] = theme;
    localStorage.setItem(THEME_KEY, theme);
  }
}
