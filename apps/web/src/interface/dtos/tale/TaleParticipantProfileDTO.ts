import {ERole} from "../../enums/ERole";

export interface TaleParticipantProfileDTO {
  id: string;
  username: string;
  characterName: string | null;
  characterImageUrl: string | null;
  role: ERole;
}
