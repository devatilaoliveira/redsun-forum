import {UpsertBasicSheetDTO} from "./UpsertBasicSheetDTO";
import {UpsertRedSunSheetDTO} from "./UpsertRedSunSheetDTO";

export type {UpsertBasicSheetDTO} from "./UpsertBasicSheetDTO";

export interface UpsertCharacterSheetDTO {
  sheet: UpsertBasicSheetDTO & {
    redsun?: UpsertRedSunSheetDTO | null;
  };
}
