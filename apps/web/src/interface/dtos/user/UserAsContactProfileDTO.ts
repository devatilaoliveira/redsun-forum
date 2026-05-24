import {EProfileLanguage} from "../../enums/EProfileLanguage";
import {ERole} from "../../enums/ERole";
import {ERuleSystem} from "../../enums/ERuleSystem";

export interface UserAsContactProfileDTO {
  id: string;
  username: string;
  imageURL: string;
  description: string | null;
  favoriteLanguage: EProfileLanguage[] | null;
  favoriteRules: ERuleSystem[] | null;
  favoriteRole: ERole[] | null;
}
