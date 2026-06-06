import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {
  CharacterSheetResponseDTO
} from "../interface/dtos/characterSheet/CharacterSheetDTO";
import {environment} from "../environments/environment";
import {UpsertCharacterSheetDTO} from "../interface/dtos/characterSheet/UpsertCharacterSheetDTO";
import {ERuleSystem} from "../interface/enums/ERuleSystem";

const CHARACTER_SHEET_ENDPOINT = `${environment.apiBaseUrl}/character-sheet`;

export interface ICharacterSheetService {
  getCharacterSheet(taleId: string, characterSheetId: string): Observable<CharacterSheetResponseDTO>;
  getMyCharacterSheet(taleId: string, characterSheetId: string): Observable<CharacterSheetResponseDTO>;
  upsertCharacterSheet(
    taleId: string,
    characterSheetId: string,
    ruleSystem: ERuleSystem,
    request: UpsertCharacterSheetDTO,
    avatarFile?: File | null,
    basicSheetOnly?: boolean
  ): Observable<CharacterSheetResponseDTO>;
}

@Injectable({providedIn: "root"})
export class CharacterSheetService implements ICharacterSheetService {
  private readonly _http: HttpClient = inject(HttpClient);

  public getCharacterSheet(taleId: string, characterSheetId: string): Observable<CharacterSheetResponseDTO> {
    return this._http.get<CharacterSheetResponseDTO>(
      `${CHARACTER_SHEET_ENDPOINT}/${taleId}`,
      {params: {characterSheetId}}
    );
  }

  public getMyCharacterSheet(taleId: string, characterSheetId: string): Observable<CharacterSheetResponseDTO> {
    return this.getCharacterSheet(taleId, characterSheetId);
  }

  public upsertCharacterSheet(
    taleId: string,
    characterSheetId: string,
    ruleSystem: ERuleSystem,
    request: UpsertCharacterSheetDTO,
    avatarFile?: File | null,
    basicSheetOnly: boolean = false
  ): Observable<CharacterSheetResponseDTO> {
    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(request)], {type: "application/json"}));
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    // TODO: This might be `${CHARACTER_SHEET_ENDPOINT}/${taleId}/${ruleSystem}`,
    return this._http.put<CharacterSheetResponseDTO>(
      `${CHARACTER_SHEET_ENDPOINT}/${taleId}/${this.endpointFor(ruleSystem, basicSheetOnly)}`,
      formData,
      {params: {characterSheetId}}
    );
  }

  private endpointFor(ruleSystem: ERuleSystem, basicSheetOnly: boolean): "basic" | "redsun" {
    if (basicSheetOnly) {
      return "basic";
    }

    return ruleSystem === ERuleSystem.REDSUN ? "redsun" : "basic";
  }
}
