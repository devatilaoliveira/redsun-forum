import {inject, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, map} from "rxjs";
import {FindUsersFiltersDTO} from "../interface/dtos/user/FindUsersFiltersDTO";
import {UserFinderResultDTO} from "../interface/dtos/user/UserFinderResultDTO";
import {environment} from "../environments/environment";
import {PageInfo, PageResponse} from "../interface/dtos/general/PageResponse";

export interface IUserFinderService {
  findUsers(filters: FindUsersFiltersDTO): Observable<PageResponse<UserFinderResultDTO>>;
}

type RawFindUsersResponse = PageResponse<UserFinderResultDTO> & Partial<PageInfo>;

@Injectable({providedIn: "root"})
export class UserFinderService implements IUserFinderService {
  private readonly _http: HttpClient = inject(HttpClient);

  public findUsers(filters: FindUsersFiltersDTO): Observable<PageResponse<UserFinderResultDTO>> {
    let params = new HttpParams()
      .set("page", String(Math.max(filters.page ?? 0, 0)))
      .set("size", String(filters.size ?? 10));

    const trimmedUserName = filters.userName?.trim() ?? "";
    if (trimmedUserName) {
      params = params.set("userName", trimmedUserName);
    }

    if (filters.role) {
      params = params.set("role", filters.role);
    }

    if (filters.rule) {
      params = params.set("rule", filters.rule);
    }

    if (filters.language) {
      params = params.set("language", filters.language);
    }

    return this._http.get<RawFindUsersResponse>(`${environment.apiBaseUrl}/user/find-users`, {params}).pipe(
      map((response) => this.normalizeResponse(response))
    );
  }

  private normalizeResponse(response: RawFindUsersResponse): PageResponse<UserFinderResultDTO> {
    if (response.page) {
      return response;
    }

    return {
      content: response.content ?? [],
      page: {
        size: response.size ?? 10,
        number: response.number ?? 0,
        totalElements: response.totalElements ?? response.content?.length ?? 0,
        totalPages: response.totalPages ?? 1
      }
    };
  }
}
