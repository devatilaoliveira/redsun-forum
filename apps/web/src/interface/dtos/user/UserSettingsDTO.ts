import {ELanguage} from "../../enums/ELanguage";
import {EThemeApplication} from "../../enums/EThemeApplication";

export interface UserSettingsDTO {
  appLanguage: ELanguage;
  appTheme: EThemeApplication;
  redirectToFavorite: boolean;
  favoriteTaleId: string | null;
}
