import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";
import {LetterCreateRequestDTO} from "../interface/dtos/letter/LetterCreateRequestDTO";
import {LetterDTO} from "../interface/dtos/letter/LetterDTO";
import {PageResponse} from "../interface/dtos/general/PageResponse";

export interface ILetterService {
  createLetter(payload: LetterCreateRequestDTO): Observable<LetterDTO>;
  listLetters(page?: number, size?: number): Observable<PageResponse<LetterDTO>>;
  listSentLetters(page?: number, size?: number): Observable<PageResponse<LetterDTO>>;
  getLetter(letterId: string): Observable<LetterDTO>;
}

@Injectable({providedIn: "root"})
export class LetterService implements ILetterService {
  private readonly _http: HttpClient = inject(HttpClient);

  public createLetter(payload: LetterCreateRequestDTO): Observable<LetterDTO> {
    return this._http.post<LetterDTO>(`${environment.apiBaseUrl}/letters`, payload);
  }

  public listLetters(page: number = 0, size: number = 10): Observable<PageResponse<LetterDTO>> {
    return this._http.get<PageResponse<LetterDTO>>(
      `${environment.apiBaseUrl}/letters/received`,
      {params: {page, size}}
    );
  }

  public listSentLetters(page: number = 0, size: number = 10): Observable<PageResponse<LetterDTO>> {
    return this._http.get<PageResponse<LetterDTO>>(
      `${environment.apiBaseUrl}/letters/sent`,
      {params: {page, size}}
    );
  }

  public getLetter(letterId: string): Observable<LetterDTO> {
    return this._http.get<LetterDTO>(`${environment.apiBaseUrl}/letters/${letterId}`);
  }
}
