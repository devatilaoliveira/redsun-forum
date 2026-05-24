import {HttpClient} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";
import {SupportRequestDTO} from "../interface/dtos/support/SupportRequestDTO";

export interface ISupportService {
  sendSupportMessage(request: SupportRequestDTO): Observable<string>;
}

@Injectable({providedIn: "root"})
export class SupportService implements ISupportService {
  private readonly _httpClient: HttpClient = inject(HttpClient);

  public sendSupportMessage(request: SupportRequestDTO): Observable<string> {
    return this._httpClient.post(`${environment.apiBaseUrl}/support`, request, {
      responseType: "text"
    });
  }
}
