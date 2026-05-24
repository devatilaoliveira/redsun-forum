import {EProfileLanguage} from "../../enums/EProfileLanguage";
import {ERole} from "../../enums/ERole";
import {ERuleSystem} from "../../enums/ERuleSystem";

export interface FindUsersFiltersDTO {
  page?: number;
  size?: number;
  userName: string | null;
  role: ERole | null;
  rule: ERuleSystem | null;
  language: EProfileLanguage | null;
}
