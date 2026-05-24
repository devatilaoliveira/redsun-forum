import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";
import {LegalDocumentMetadataDTO} from "../interface/dtos/legal/LegalDocumentMetadataDTO";

export interface ILegalService {
  getCurrentDocuments(): Observable<LegalDocumentMetadataDTO>;
}

@Injectable({providedIn: "root"})
export class LegalService implements ILegalService {
  private readonly _httpClient: HttpClient = inject(HttpClient);

  public getCurrentDocuments(): Observable<LegalDocumentMetadataDTO> {
    return this._httpClient.get<LegalDocumentMetadataDTO>(`${environment.apiBaseUrl}/legal/documents/current`);
  }
}
