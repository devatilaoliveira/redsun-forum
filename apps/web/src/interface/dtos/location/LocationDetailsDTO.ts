import {ELocationStatus} from "../../enums/ELocationStatus";
import {TaleParticipantProfileDTO} from "../tale/TaleParticipantProfileDTO";


export interface LocationDetailsDTO {
  id: string;
  taleId: string;
  taleOwnerId: string;
  author: TaleParticipantProfileDTO;
  locationName: string;
  description: string;
  imageUrl: string | null;
  lastTimeActive: string;
  status: ELocationStatus;
}
