import {RedSunSheetResponseDTO} from "./RedSunSheetResponseDTO";

export type UpsertRedSunSheetDTO = Omit<
  RedSunSheetResponseDTO,
  "id" | "characterId" | "characterName" | "characterDescription" | "characterImageUrl"
>;
