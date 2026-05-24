import {UserAsContactDTO} from "../user/UserAsContactDTO";

export interface LetterDTO {
  id: string | null;
  sender: UserAsContactDTO | null;
  recipients: UserAsContactDTO[];
  readBy: UserAsContactDTO[];
  sentAt: string | null;
  subject: string | null;
  content: string | null;
}
