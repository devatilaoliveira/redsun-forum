import {ELanguage} from "../../enums/ELanguage";
import {EThemeApplication} from "../../enums/EThemeApplication";

export interface UserSettingsDTO {
  appLanguage: ELanguage | null;
  appTheme: EThemeApplication | null;
}
