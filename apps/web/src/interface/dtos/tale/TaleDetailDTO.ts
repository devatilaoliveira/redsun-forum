import {ETaleStatus} from "../../enums/ETaleStatus";
import {ERuleSystem} from "../../enums/ERuleSystem";
import {LocationDTO} from "../location/LocationDTO";
import {TaleParticipantProfileDTO} from "./TaleParticipantProfileDTO";

export interface TaleDetailDTO {
  id: string;
  taleName: string;
  isPublic: boolean;
  description: string;
  language: string;
  status: ETaleStatus;
  imageUrl: string | null;
  rules: ERuleSystem;
  creationDate: string | null;
  lastTimeActive: string | null;
  participants: TaleParticipantProfileDTO[];
  author: TaleParticipantProfileDTO;
  locations: LocationDTO[];
}
