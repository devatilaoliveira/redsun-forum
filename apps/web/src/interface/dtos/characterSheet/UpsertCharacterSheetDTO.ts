import {UpsertBasicSheetDTO} from "./UpsertBasicSheetDTO";
import {UpsertRedSunSheetDTO} from "./UpsertRedSunSheetDTO";

export type {UpsertBasicSheetDTO} from "./UpsertBasicSheetDTO";
export type {UpsertRedSunSheetDTO} from "./UpsertRedSunSheetDTO";

export type UpsertCharacterSheetDTO = UpsertBasicSheetDTO | (UpsertBasicSheetDTO & UpsertRedSunSheetDTO);
