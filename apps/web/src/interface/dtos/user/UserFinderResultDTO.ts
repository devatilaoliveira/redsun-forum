import {EProfileLanguage} from "../../enums/EProfileLanguage";
import {ERole} from "../../enums/ERole";
import {ERuleSystem} from "../../enums/ERuleSystem";

export interface UserFinderResultDTO {
  id: string;
  username: string;
  imageURL: string | null;
  description: string | null;
  favoriteLanguage: EProfileLanguage[] | null;
  favoriteRules: ERuleSystem[] | null;
  favoriteRole: ERole[] | null;
}
