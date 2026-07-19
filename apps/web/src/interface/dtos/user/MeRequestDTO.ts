import {EProfileLanguage} from "../../enums/EProfileLanguage";
import {EFavoriteRole} from "../../enums/EFavoriteRole";
import {ERuleSystem} from "../../enums/ERuleSystem";

export interface MeRequestDTO {
  username?: string;
  description?: string;
  favoriteLanguage?: EProfileLanguage[] | null;
  favoriteRules?: ERuleSystem[] | null;
  favoriteRole?: EFavoriteRole[] | null;
}
