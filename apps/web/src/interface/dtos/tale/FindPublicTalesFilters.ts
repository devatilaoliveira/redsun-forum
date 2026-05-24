import {ELanguage} from "../../enums/ELanguage";
import {ERuleSystem} from "../../enums/ERuleSystem";

export interface FindPublicTalesFilters {
  page?: number;
  size?: number;
  language?: ELanguage | null;
  rules?: ERuleSystem | null;
}
