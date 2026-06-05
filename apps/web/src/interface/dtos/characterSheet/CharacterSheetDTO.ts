import {ERuleSystem} from "../../enums/ERuleSystem";
import {BasicSheetDTO} from "./BasicSheetDTO";
import {RedSunSheetResponseDTO} from "./RedSunSheetResponseDTO";

export type {BasicSheetDTO} from "./BasicSheetDTO";

export type CharacterSheetDTO = BasicSheetDTO | RedSunSheetResponseDTO;

export interface CharacterSheetResponseDTO {
  ruleSystem: ERuleSystem;
  sheet: CharacterSheetDTO;
}
