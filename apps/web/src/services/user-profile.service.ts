import {inject, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {MeResponseDTO} from "../interface/dtos/user/MeResponseDTO";
import {MeRequestDTO} from "../interface/dtos/user/MeRequestDTO";
import {UserSettingsRequestDTO} from "../interface/dtos/user/UserSettingsRequestDTO";
import {environment} from "../environments/environment";
import {HttpClient} from "@angular/common/http";
import {LegalAcknowledgementRequestDTO} from "../interface/dtos/user/LegalAcknowledgementRequestDTO";
import {AppSettingsService, IAppSettingsService} from "./app-settings.service";
import {UserSettingsInitializationRequestDTO} from "../interface/dtos/user/UserSettingsInitializationRequestDTO";

export interface IUserProfileService {
  upsertCurrentUser(): Observable<MeResponseDTO>;

  saveAvatar(formData: FormData): Observable<MeResponseDTO>;

  deleteAvatar(): Observable<MeResponseDTO>;

  updateMe(request: MeRequestDTO): Observable<MeResponseDTO>;

  updateMySettings(request: UserSettingsRequestDTO): Observable<MeResponseDTO>;

  acknowledgeLegalDocuments(request: LegalAcknowledgementRequestDTO): Observable<MeResponseDTO>;

  deleteMe(): Observable<boolean>;
}

@Injectable({providedIn: "root"})
export class UserProfileService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _appSettingsService: IAppSettingsService = inject(AppSettingsService);

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

  public acknowledgeLegalDocuments(request: LegalAcknowledgementRequestDTO): Observable<MeResponseDTO> {
    return this._httpClient.post<MeResponseDTO>(
      `${environment.apiBaseUrl}/user/me/legal-acknowledgement`,
      request
    );
  }

  public deleteMe(): Observable<boolean> {
    return this._httpClient.delete<boolean>(`${environment.apiBaseUrl}/user/me`);
  }
}
