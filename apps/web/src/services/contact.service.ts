import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";
import {UserAsContactDTO} from "../interface/dtos/user/UserAsContactDTO";
import {UserAsContactProfileDTO} from "../interface/dtos/user/UserAsContactProfileDTO";

export interface IContactService {
  listContacts(): Observable<UserAsContactDTO[]>;
  addContactByIdentifier(identifier: string): Observable<UserAsContactDTO>;
  addContactById(request: string): Observable<UserAsContactDTO>;
  removeContactById(contactId: string): Observable<boolean>;
  getUserAsContactProfile(contactId: string): Observable<UserAsContactProfileDTO>;
}

@Injectable({providedIn: "root"})
export class ContactService implements IContactService {
  private readonly _httpClient: HttpClient = inject(HttpClient);

  public listContacts(): Observable<UserAsContactDTO[]> {
    return this._httpClient.get<UserAsContactDTO[]>(
      `${environment.apiBaseUrl}/user/contacts`
    );
  }

  public addContactByIdentifier(identifier: string): Observable<UserAsContactDTO> {
    return this._httpClient.post<UserAsContactDTO>(
      `${environment.apiBaseUrl}/user/contacts/by-identifier/${identifier}`,
      null
    );
  }

  public addContactById(userId: string): Observable<UserAsContactDTO> {
    return this._httpClient.post<UserAsContactDTO>(
      `${environment.apiBaseUrl}/user/contacts/by-id/${userId}`,
      null
    );
  }

  public removeContactById(contactId: string): Observable<boolean> {
    return this._httpClient.delete<boolean>(
      `${environment.apiBaseUrl}/user/contacts/${contactId}`
    );
  }

  public getUserAsContactProfile(contactId: string): Observable<UserAsContactProfileDTO> {
    return this._httpClient.get<UserAsContactProfileDTO>(
      `${environment.apiBaseUrl}/user/contacts/${contactId}`
    );
  }
}
