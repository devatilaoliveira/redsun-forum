import {ERuleSystem} from "../../enums/ERuleSystem";
import {BasicSheetDTO} from "./BasicSheetDTO";
import {RedSunSheetDTO} from "./RedSunSheetDTO";

export type {BasicSheetDTO} from "./BasicSheetDTO";

export interface CharacterSheetDTO extends BasicSheetDTO {
  redsun?: RedSunSheetDTO | null;
}

export interface CharacterSheetResponseDTO {
  ruleSystem: ERuleSystem;
  sheet: CharacterSheetDTO;
}
