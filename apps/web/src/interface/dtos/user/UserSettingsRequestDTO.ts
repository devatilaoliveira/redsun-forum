import {ELanguage} from "../../enums/ELanguage";
import {EThemeApplication} from "../../enums/EThemeApplication";

export interface UserSettingsRequestDTO {
  appLanguage?: ELanguage;
  appTheme?: EThemeApplication;
}
