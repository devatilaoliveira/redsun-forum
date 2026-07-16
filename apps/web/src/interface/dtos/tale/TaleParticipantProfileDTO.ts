import {ETaleRole} from "../../enums/ETaleRole";

export interface TaleParticipantProfileDTO {
  id: string;
  username: string;
  characterName: string | null;
  characterImageUrl: string | null;
  isDeleted: boolean;
  role: ETaleRole;
}
