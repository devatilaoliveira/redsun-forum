import {ETaleStatus} from "../../enums/ETaleStatus";
import {ERuleSystem} from "../../enums/ERuleSystem";
import {ELanguage} from "../../enums/ELanguage";


export interface TaleResponseDTO {
  id: string;
  taleName: string;
  isPublic: boolean;
  description: string;
  language: ELanguage | null;
  status: ETaleStatus;
  imageUrl: string | null;
  rules: ERuleSystem;
  creationDate?: string;
  lastTimeActive?: string;
  participantsCount: number;
}
