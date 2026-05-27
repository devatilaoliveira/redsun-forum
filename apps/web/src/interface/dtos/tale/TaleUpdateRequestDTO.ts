import {ETaleStatus} from "../../enums/ETaleStatus";
import {ERuleSystem} from "../../enums/ERuleSystem";
import {ELanguage} from "../../enums/ELanguage";

export interface TaleUpdateRequestDTO {
  taleName?: string | null;
  isPublic?: boolean | null;
  description?: string | null;
  language?: ELanguage | null;
  image?: File | null;
  removeImage?: boolean | null;
  status?: ETaleStatus | null;
  rules?: ERuleSystem | string | null;
}
