import {MeResponseDTO} from "../dtos/user/MeResponseDTO";

export interface IOAuthResult {
  message?: string;
  user?: MeResponseDTO;
}
