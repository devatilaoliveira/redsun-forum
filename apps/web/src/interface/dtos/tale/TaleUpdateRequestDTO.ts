import {ETaleStatus} from "../../enums/ETaleStatus";
import {ERuleSystem} from "../../enums/ERuleSystem";

export interface TaleUpdateRequestDTO {
  taleName?: string | null;
  isPublic?: boolean | null;
  description?: string | null;
  language: string;
  image?: File | null;
  removeImage?: boolean | null;
  status?: ETaleStatus | null;
  rules?: ERuleSystem | string | null;
}
