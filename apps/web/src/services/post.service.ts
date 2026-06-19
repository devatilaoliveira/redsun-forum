import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";
import {PostCreateRequestDTO} from "../interface/dtos/post/PostCreateRequestDTO";
import {PostDTO} from "../interface/dtos/post/PostDTO";
import {PageResponse} from "../interface/dtos/general/PageResponse";
import {PostImproveTextResponseDTO} from "../interface/dtos/post/PostImproveTextResponseDTO";

export interface IPostService {
  createPost(payload: PostCreateRequestDTO): Observable<PostDTO>;
  listPostsForLocation(locationId: string, page?: number, size?: number): Observable<PageResponse<PostDTO>>;
  improvePostTextWithAI(content: string): Observable<PostImproveTextResponseDTO>;
  deletePost(postId: string): Observable<void>;
  deactivatePost(postId: string): Observable<void>;
}

@Injectable({providedIn: "root"})
export class PostService implements IPostService {
  private readonly _http: HttpClient = inject(HttpClient);

  public createPost(request: PostCreateRequestDTO): Observable<PostDTO> {
    return this._http.post<PostDTO>(
      `${environment.apiBaseUrl}/posts`,
      request
    );
  }

  public listPostsForLocation(
    locationId: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<PostDTO>> {
    return this._http.get<PageResponse<PostDTO>>(
      `${environment.apiBaseUrl}/posts`,
      {params: {locationId, page, size}}
    );
  }

  public improvePostTextWithAI(content: string): Observable<PostImproveTextResponseDTO> {
    return this._http.post<PostImproveTextResponseDTO>(
      `${environment.apiBaseUrl}/posts/improve-text`,
      {content}
    );
  }

  public deletePost(postId: string): Observable<void> {
    return this._http.delete<void>(`${environment.apiBaseUrl}/posts/${postId}`);
  }

  public deactivatePost(postId: string): Observable<void> {
    return this._http.post<void>(`${environment.apiBaseUrl}/posts/${postId}/inactive`, null);
  }
}
