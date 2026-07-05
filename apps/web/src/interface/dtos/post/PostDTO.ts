import {EPostStatus} from "../../enums/EPostStatus";
import {EPostType} from "../../enums/EPostType";
import {TaleParticipantProfileDTO} from "../tale/TaleParticipantProfileDTO";

export interface PostDTO {
  id: string;
  author: TaleParticipantProfileDTO;
  locationId: string;
  taleId: string;
  content: string;
  creationDate: string;
  status: EPostStatus;
  type: EPostType;
}
