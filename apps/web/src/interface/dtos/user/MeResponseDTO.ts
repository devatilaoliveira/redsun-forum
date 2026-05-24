import {UserAsContactDTO} from "./UserAsContactDTO";
import {SubscriptionDTO} from "../subscription/SubscriptionDTO";
import {EProfileLanguage} from "../../enums/EProfileLanguage";
import {ERuleSystem} from "../../enums/ERuleSystem";
import {ERole} from "../../enums/ERole";

export interface MeResponseDTO {
  id: string;
  username: string;
  email: string;
  imageURL: string;
  description?: string;
  favoriteLanguage: EProfileLanguage[] | null;
  favoriteRules: ERuleSystem[] | null;
  favoriteRole: ERole[] | null;
  subscription?: SubscriptionDTO | null;
  contacts: UserAsContactDTO[];
  legalAcknowledgement: LegalAcknowledgementDTO;
}

export interface LegalAcknowledgementDTO {
  termsAccepted: boolean;
  privacyAcknowledged: boolean;
  current: boolean;
  termsVersion?: string | null;
  privacyVersion?: string | null;
  requiredTermsVersion: string;
  requiredPrivacyVersion: string;
}
