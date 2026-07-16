import {EProfileLanguage} from "../../enums/EProfileLanguage";
import {EFavoriteRole} from "../../enums/EFavoriteRole";
import {ERuleSystem} from "../../enums/ERuleSystem";

export interface FindUsersFiltersDTO {
  page?: number;
  size?: number;
  userName: string | null;
  role: EFavoriteRole | null;
  rule: ERuleSystem | null;
  language: EProfileLanguage | null;
}
