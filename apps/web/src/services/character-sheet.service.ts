import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {
  CharacterSheetResponseDTO
} from "../interface/dtos/characterSheet/CharacterSheetDTO";
import {environment} from "../environments/environment";
import {UpsertCharacterSheetDTO} from "../interface/dtos/characterSheet/UpsertCharacterSheetDTO";

const CHARACTER_SHEET_ENDPOINT = `${environment.apiBaseUrl}/character-sheet`;

export interface ICharacterSheetService {
  getCharacterSheet(taleId: string, characterSheetId: string): Observable<CharacterSheetResponseDTO>;
  getMyCharacterSheet(taleId: string, characterSheetId: string): Observable<CharacterSheetResponseDTO>;
  upsertCharacterSheet(
    taleId: string,
    characterSheetId: string,
    request: UpsertCharacterSheetDTO,
    avatarFile?: File | null
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
    request: UpsertCharacterSheetDTO,
    avatarFile?: File | null
  ): Observable<CharacterSheetResponseDTO> {
    const formData = new FormData();
    formData.append("request", new Blob([JSON.stringify(request)], {type: "application/json"}));
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    return this._http.put<CharacterSheetResponseDTO>(
      `${CHARACTER_SHEET_ENDPOINT}/${taleId}`,
      formData,
      {params: {characterSheetId}}
    );
  }
}

