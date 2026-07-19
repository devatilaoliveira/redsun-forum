import {ELanguage} from "../../enums/ELanguage";
import {EThemeApplication} from "../../enums/EThemeApplication";

export interface UserSettingsInitializationRequestDTO {
  appLanguage: ELanguage;
  appTheme: EThemeApplication;
}
