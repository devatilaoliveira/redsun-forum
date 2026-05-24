import {ETaleStatus} from "../../enums/ETaleStatus";
import {ERuleSystem} from "../../enums/ERuleSystem";


export interface TaleResponseDTO {
  id: string;
  taleName: string;
  isPublic: boolean;
  description: string;
  language: string;
  status: ETaleStatus;
  imageUrl: string | null;
  rules: ERuleSystem;
  creationDate?: string;
  lastTimeActive?: string;
  participantsCount: number;
}
