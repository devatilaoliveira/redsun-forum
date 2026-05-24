import {inject, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {MeResponseDTO} from "../interface/dtos/user/MeResponseDTO";
import {MeRequestDTO} from "../interface/dtos/user/MeRequestDTO";
import {environment} from "../environments/environment";
import {HttpClient} from "@angular/common/http";
import {ChangePasswordRequestDTO} from "../interface/dtos/user/ChangePasswordRequestDTO";
import {LegalAcknowledgementRequestDTO} from "../interface/dtos/user/LegalAcknowledgementRequestDTO";

export interface IUserProfileService {
  upsertCurrentUser(): Observable<MeResponseDTO>;

  saveAvatar(formData: FormData): Observable<MeResponseDTO>;

  deleteAvatar(): Observable<MeResponseDTO>;

  updateMe(request: MeRequestDTO): Observable<MeResponseDTO>;

  acknowledgeLegalDocuments(request: LegalAcknowledgementRequestDTO): Observable<MeResponseDTO>;

  deleteMe(): Observable<boolean>;

  changePassword(request: ChangePasswordRequestDTO): Observable<string>;
}

@Injectable({providedIn: "root"})
export class UserProfileService {
  private readonly _httpClient: HttpClient = inject(HttpClient);

  public upsertCurrentUser(): Observable<MeResponseDTO> {
    return this._httpClient.post<MeResponseDTO>(
      `${environment.apiBaseUrl}/user/me`,
      {}
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

  public acknowledgeLegalDocuments(request: LegalAcknowledgementRequestDTO): Observable<MeResponseDTO> {
    return this._httpClient.post<MeResponseDTO>(
      `${environment.apiBaseUrl}/user/me/legal-acknowledgement`,
      request
    );
  }

  public deleteMe(): Observable<boolean> {
    return this._httpClient.delete<boolean>(`${environment.apiBaseUrl}/user/me`);
  }

  public changePassword(request: ChangePasswordRequestDTO): Observable<string> {
    return this._httpClient.patch(`${environment.apiBaseUrl}/user/me/password`, request, {
      responseType: "text"
    });
  }
}
