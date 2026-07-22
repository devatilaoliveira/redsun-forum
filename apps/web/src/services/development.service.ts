import {inject, Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";
import {PostDTO} from "../interface/dtos/post/PostDTO";

export interface IDevelopmentService {
  searchPosts(taleId: string, characterName?: string, content?: string): Observable<PostDTO[]>;
}

interface SearchPostsParams {
  characterName?: string;
  content?: string;
}

@Injectable({providedIn: "root"})
export class DevelopmentService implements IDevelopmentService {
  private readonly _http: HttpClient = inject(HttpClient);

  public searchPosts(taleId: string, characterName?: string, content?: string): Observable<PostDTO[]> {
    const params = new HttpParams({
      fromObject: {
        ...(characterName ? {characterName} : {}),
        ...(content ? {content} : {})
      } satisfies SearchPostsParams
    });

    return this._http.get<PostDTO[]>(
      `${environment.apiBaseUrl}/development/tales/${taleId}/search-posts`,
      {params}
    );
  }
}
