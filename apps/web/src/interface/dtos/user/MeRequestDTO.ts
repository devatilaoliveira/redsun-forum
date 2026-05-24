import {EProfileLanguage} from "../../enums/EProfileLanguage";
import {ERole} from "../../enums/ERole";
import {ERuleSystem} from "../../enums/ERuleSystem";

export interface MeRequestDTO {
  username?: string;
  description?: string;
  favoriteLanguage?: EProfileLanguage[] | null;
  favoriteRules?: ERuleSystem[] | null;
  favoriteRole?: ERole[] | null;
}
