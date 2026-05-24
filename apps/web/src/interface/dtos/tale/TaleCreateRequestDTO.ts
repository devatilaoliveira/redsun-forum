import {ETaleStatus} from "../../enums/ETaleStatus";
import {ERuleSystem} from "../../enums/ERuleSystem";

export interface TaleCreateRequestDTO {
  taleName: string;
  participantsIds: string[];
  isPublic: boolean;
  description: string;
  language: string;
  image?: File | null;
  status?: ETaleStatus;
  rules: ERuleSystem;
}
