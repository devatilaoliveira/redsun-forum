import {EProfileLanguage} from "../../enums/EProfileLanguage";
import {EFavoriteRole} from "../../enums/EFavoriteRole";
import {ERuleSystem} from "../../enums/ERuleSystem";

export interface UserFinderResultDTO {
  id: string;
  username: string;
  imageURL: string | null;
  description: string | null;
  favoriteLanguage: EProfileLanguage[] | null;
  favoriteRules: ERuleSystem[] | null;
  favoriteRole: EFavoriteRole[] | null;
}
