import {inject, Injectable} from "@angular/core";
import {Observable, tap} from "rxjs";
import {MeResponseDTO} from "../interface/dtos/user/MeResponseDTO";
import {MeRequestDTO} from "../interface/dtos/user/MeRequestDTO";
import {UserSettingsRequestDTO} from "../interface/dtos/user/UserSettingsRequestDTO";
import {environment} from "../environments/environment";
import {HttpClient} from "@angular/common/http";
import {LegalAcknowledgementRequestDTO} from "../interface/dtos/user/LegalAcknowledgementRequestDTO";
import {AppSettingsService, IAppSettingsService} from "./app-settings.service";
import {UserSettingsInitializationRequestDTO} from "../interface/dtos/user/UserSettingsInitializationRequestDTO";
import {ILocalStoreService, LocalStoreService} from "./local-store.service";

export interface IUserProfileService {
  upsertCurrentUser(): Observable<MeResponseDTO>;

  saveAvatar(formData: FormData): Observable<MeResponseDTO>;

  deleteAvatar(): Observable<MeResponseDTO>;

  updateMe(request: MeRequestDTO): Observable<MeResponseDTO>;

  updateMySettings(request: UserSettingsRequestDTO): Observable<MeResponseDTO>;

  setFavoriteTale(taleId: string): Observable<MeResponseDTO>;

  clearFavoriteTale(): Observable<MeResponseDTO>;

  acknowledgeLegalDocuments(request: LegalAcknowledgementRequestDTO): Observable<MeResponseDTO>;

  deleteMe(): Observable<boolean>;
}

@Injectable({providedIn: "root"})
export class UserProfileService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _appSettingsService: IAppSettingsService = inject(AppSettingsService);
  private readonly _localStoreService: ILocalStoreService = inject(LocalStoreService);

  public upsertCurrentUser(): Observable<MeResponseDTO> {
    const request: UserSettingsInitializationRequestDTO = {
      appLanguage: this._appSettingsService.language(),
      appTheme: this._appSettingsService.theme()
    };

    return this._httpClient.post<MeResponseDTO>(
      `${environment.apiBaseUrl}/user/me`,
      request
    );
  }

  public saveAvatar(formData: FormData): Observable<MeResponseDTO> {
    return this._httpClient.post<MeResponseDTO>(`${environment.apiBaseUrl}/user/avatar`, formData);
  }

  public deleteAvatar(): Observable<MeResponseDTO> {
    return this._httpClient.delete<MeResponseDTO>(`${environment.apiBaseUrl}/user/avatar`);
  }

  public updateMe(request: MeRequestDTO): Observable<MeResponseDTO> {
    return this._httpClient.patch<MeResponseDTO>(
      `${environment.apiBaseUrl}/user/me`,
      request
    );
  }

  public updateMySettings(request: UserSettingsRequestDTO): Observable<MeResponseDTO> {
    return this._httpClient.patch<MeResponseDTO>(
      `${environment.apiBaseUrl}/user/me/settings`,
      request
    );
  }

  public setFavoriteTale(taleId: string): Observable<MeResponseDTO> {
    return this._httpClient.put<MeResponseDTO>(
      `${environment.apiBaseUrl}/user/me/settings/favorite-tale/${encodeURIComponent(taleId)}`,
      null
    ).pipe(tap((user) => this._applyUpdatedUser(user)));
  }

  public clearFavoriteTale(): Observable<MeResponseDTO> {
    return this._httpClient.delete<MeResponseDTO>(
      `${environment.apiBaseUrl}/user/me/settings/favorite-tale`
    ).pipe(tap((user) => this._applyUpdatedUser(user)));
  }

  public acknowledgeLegalDocuments(request: LegalAcknowledgementRequestDTO): Observable<MeResponseDTO> {
    return this._httpClient.post<MeResponseDTO>(
      `${environment.apiBaseUrl}/user/me/legal-acknowledgement`,
      request
    );
  }

  public deleteMe(): Observable<boolean> {
    return this._httpClient.delete<boolean>(`${environment.apiBaseUrl}/user/me`);
  }

  private _applyUpdatedUser(user: MeResponseDTO): void {
    this._localStoreService.storeUser(user);
    this._appSettingsService.applyUserSettings(user.userSettings);
  }
}
