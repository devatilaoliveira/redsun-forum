import {ERuleSystem} from "../../enums/ERuleSystem";

export interface BasicSheetDTO {
  id: string | null;
  characterId: string | null;
  characterName: string | null;
  characterDescription: string | null;
  characterImageUrl: string | null;
}

export interface CharacterSheetResponseDTO {
  ruleSystem: ERuleSystem;
  sheet: BasicSheetDTO;
}
