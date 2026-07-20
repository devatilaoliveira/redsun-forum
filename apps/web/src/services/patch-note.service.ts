import {HttpClient} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";
import {PageResponse} from "../interface/dtos/general/PageResponse";
import {PatchNoteDTO} from "../interface/dtos/patchNote/PatchNoteDTO";
import {AppSettingsService, IAppSettingsService} from "./app-settings.service";

export interface IPatchNoteService {
  getPatchNotes(page?: number): Observable<PageResponse<PatchNoteDTO>>;
}

@Injectable({providedIn: "root"})
export class PatchNoteService implements IPatchNoteService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly _appSettings: IAppSettingsService = inject(AppSettingsService);

  public getPatchNotes(page: number = 0): Observable<PageResponse<PatchNoteDTO>> {
    return this._http.get<PageResponse<PatchNoteDTO>>(
      `${environment.apiBaseUrl}/patch-notes`,
      {params: {page, language: this._appSettings.getLanguage()}}
    );
  }
}
