import {inject, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {catchError, Observable, of, shareReplay, tap, throwError} from "rxjs";
import {environment} from "../environments/environment";
import {PageResponse} from "../interface/dtos/general/PageResponse";
import {TaleResponseDTO} from "../interface/dtos/tale/TaleResponseDTO";
import {TaleDetailDTO} from "../interface/dtos/tale/TaleDetailDTO";
import {TaleCreateRequestDTO} from "../interface/dtos/tale/TaleCreateRequestDTO";
import {TaleUpdateRequestDTO} from "../interface/dtos/tale/TaleUpdateRequestDTO";
import {FindPublicTalesFilters} from "../interface/dtos/tale/FindPublicTalesFilters";

export interface ITaleService {
  createTale(request: TaleCreateRequestDTO): Observable<TaleDetailDTO>;
  updateTale(taleId: string, request: TaleUpdateRequestDTO): Observable<TaleDetailDTO>;
  archiveTale(taleId: string): Observable<void>;
  getTale(taleId: string): Observable<TaleDetailDTO>;
  getTaleCached(taleId: string): Observable<TaleDetailDTO>;
  getMyTales(page?: number, size?: number): Observable<PageResponse<TaleResponseDTO>>;
  getPublicTales(filters?: FindPublicTalesFilters): Observable<PageResponse<TaleResponseDTO>>;
  getPublicTales(page?: number, size?: number): Observable<PageResponse<TaleResponseDTO>>;
  addParticipantByIdentifier(taleId: string, identifier: string): Observable<TaleDetailDTO>;
  removeParticipantById(taleId: string, userId: string): Observable<TaleDetailDTO>;
  leaveTale(taleId: string): Observable<TaleDetailDTO>;
  transferOwnership(taleId: string, newOwnerId: string): Observable<TaleDetailDTO>;
}

@Injectable({providedIn: "root"})
export class TaleService implements ITaleService {
  private readonly _http: HttpClient = inject(HttpClient);
  private readonly taleCache = new Map<string, Observable<TaleDetailDTO>>();

  public createTale(request: TaleCreateRequestDTO): Observable<TaleDetailDTO> {
    const formData = new FormData();
    formData.append("taleName", request.taleName);
    formData.append("description", request.description);
    formData.append("language", request.language);
    formData.append("isPublic", String(request.isPublic));
    formData.append("rules", request.rules);

    if (request.participantsIds && request.participantsIds.length > 0) {
      request.participantsIds.forEach((participantId) => formData.append("participantsIds", participantId));
    }

    if (request.image) {
      formData.append("image", request.image);
    }

    return this._http.post<TaleDetailDTO>(`${environment.apiBaseUrl}/tales/create`, formData).pipe(
      tap((tale) => this.setTaleCache(tale))
    );
  }

  public updateTale(taleId: string, request: TaleUpdateRequestDTO): Observable<TaleDetailDTO> {
    const formData = new FormData();

    if (request.taleName != null) {
      formData.append("taleName", request.taleName);
    }
    if (request.isPublic != null) {
      formData.append("isPublic", String(request.isPublic));
    }
    if (request.description != null) {
      formData.append("description", request.description);
    }
    if (request.language != null) {
      formData.append("language", request.language);
    }
    if (request.image) {
      formData.append("image", request.image);
    }
    if (request.removeImage != null) {
      formData.append("removeImage", String(request.removeImage));
    }
    if (request.status != null) {
      formData.append("status", String(request.status));
    }
    if (request.rules != null) {
      formData.append("rules", String(request.rules));
    }

    return this._http.put<TaleDetailDTO>(`${environment.apiBaseUrl}/tales/${taleId}`, formData).pipe(
      tap((tale) => this.setTaleCache(tale, taleId))
    );
  }

  public archiveTale(taleId: string): Observable<void> {
    return this._http.post<void>(`${environment.apiBaseUrl}/tales/${taleId}/archive`, null
    ).pipe(
      tap(() => this.taleCache.delete(taleId))
    );
  }

  public getTale(taleId: string): Observable<TaleDetailDTO> {
    return this._http.get<TaleDetailDTO>(`${environment.apiBaseUrl}/tales/${taleId}`);
  }

  public getTaleCached(taleId: string): Observable<TaleDetailDTO> {
    const cached = this.taleCache.get(taleId);
    if (cached) {
      return cached;
    }

    const request$ = this.getTale(taleId).pipe(
      shareReplay({bufferSize: 1, refCount: false}),
      catchError((err) => {
        this.taleCache.delete(taleId);
        return throwError(() => err);
      })
    );
    this.taleCache.set(taleId, request$);
    return request$;
  }

  public getMyTales(page: number = 0, size: number = 10): Observable<PageResponse<TaleResponseDTO>> {
    return this._http.get<PageResponse<TaleResponseDTO>>(
      `${environment.apiBaseUrl}/tales/my-tales`,
      {params: {page, size}}
    );
  }

  public getPublicTales(filters?: FindPublicTalesFilters): Observable<PageResponse<TaleResponseDTO>>;
  public getPublicTales(page?: number, size?: number): Observable<PageResponse<TaleResponseDTO>>;
  public getPublicTales(
    filtersOrPage: FindPublicTalesFilters | number = {},
    size: number = 10
  ): Observable<PageResponse<TaleResponseDTO>> {
    const filters: FindPublicTalesFilters = typeof filtersOrPage === "number"
      ? {page: filtersOrPage, size}
      : filtersOrPage;

    let params = new HttpParams()
      .set("page", String(filters.page ?? 0))
      .set("size", String(filters.size ?? 10));

    if (filters.language) {
      params = params.set("language", filters.language);
    }

    if (filters.rules) {
      params = params.set("rules", filters.rules);
    }

    return this._http.get<PageResponse<TaleResponseDTO>>(
      `${environment.apiBaseUrl}/tales/find-tales`,
      {params}
    );
  }

  public addParticipantByIdentifier(
    taleId: string,
    identifier: string
  ): Observable<TaleDetailDTO> {
    return this._http.post<TaleDetailDTO>(
      `${environment.apiBaseUrl}/tales/${taleId}/participants/${identifier}`,
      null
    ).pipe(
      tap((tale) => this.setTaleCache(tale, taleId))
    );
  }

  public removeParticipantById(
    taleId: string,
    userId: string
  ): Observable<TaleDetailDTO> {
    return this._http.delete<TaleDetailDTO>(
      `${environment.apiBaseUrl}/tales/${taleId}/participants/${userId}`
    ).pipe(
      tap((tale) => this.setTaleCache(tale, taleId))
    );
  }

  public leaveTale(taleId: string): Observable<TaleDetailDTO> {
    return this._http.delete<TaleDetailDTO>(
      `${environment.apiBaseUrl}/tales/${taleId}/participants/me`
    ).pipe(
      tap((tale) => this.setTaleCache(tale, taleId))
    );
  }

  public transferOwnership(taleId: string, newOwnerId: string): Observable<TaleDetailDTO> {
    return this._http.post<TaleDetailDTO>(
      `${environment.apiBaseUrl}/tales/${taleId}/owner/${newOwnerId}`,
      null
    ).pipe(
      tap((tale) => this.setTaleCache(tale, taleId))
    );
  }

  private setTaleCache(tale: TaleDetailDTO, fallbackId?: string): void {
    const taleId = (tale as { id?: string }).id ?? fallbackId;
    if (!taleId) {
      return;
    }
    this.taleCache.set(taleId, of(tale));
  }
}
