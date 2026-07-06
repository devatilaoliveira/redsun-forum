import {EStatus} from "../enums/EStatus";

export interface AuthCallbackResult {
  status: EStatus;
  redirectUrl?: string;
  redirectState?: unknown;
}
