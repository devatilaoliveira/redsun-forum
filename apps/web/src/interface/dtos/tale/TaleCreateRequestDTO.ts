import {ETaleStatus} from "../../enums/ETaleStatus";
import {ERuleSystem} from "../../enums/ERuleSystem";
import {ELanguage} from "../../enums/ELanguage";

export interface TaleCreateRequestDTO {
  taleName: string;
  participantsIds: string[];
  isPublic: boolean;
  description: string;
  language: ELanguage | null;
  image?: File | null;
  status?: ETaleStatus;
  rules: ERuleSystem;
}
