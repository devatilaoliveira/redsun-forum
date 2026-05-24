export interface UpsertBasicSheetDTO {
  characterName: string | null;
  characterDescription: string | null;
}

export interface UpsertCharacterSheetDTO {
  sheet: UpsertBasicSheetDTO;
}
