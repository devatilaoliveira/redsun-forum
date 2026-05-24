import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../environments/environment";
import {LocationCreateRequestDTO} from "../interface/dtos/location/LocationCreateRequestDTO";
import {LocationDetailsDTO} from "../interface/dtos/location/LocationDetailsDTO";
import {LocationDTO} from "../interface/dtos/location/LocationDTO";
import {PageResponse} from "../interface/dtos/general/PageResponse";

export interface ILocationService {
  createLocation(payload: LocationCreateRequestDTO): Observable<LocationDetailsDTO>;

  listLocations(taleId: string, page?: number, size?: number): Observable<PageResponse<LocationDTO>>;

  getLocationDetails(locationId: string): Observable<LocationDetailsDTO>;

  deleteLocation(locationId: string): Observable<void>;
}

@Injectable({providedIn: "root"})
export class LocationService implements ILocationService {
  private readonly _http: HttpClient = inject(HttpClient);

  public createLocation(request: LocationCreateRequestDTO): Observable<LocationDetailsDTO> {
    const formData = new FormData();
    formData.append("taleId", request.taleId);
    formData.append("locationName", request.locationName);
    formData.append("description", request.description ?? "");

    if (request.image) {
      formData.append("image", request.image);
    }

    return this._http.post<LocationDetailsDTO>(
      `${environment.apiBaseUrl}/locations`,
      formData
    );
  }

  public listLocations(
    taleId: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<LocationDTO>> {
    return this._http.get<PageResponse<LocationDTO>>(
      `${environment.apiBaseUrl}/locations`,
      { params: {taleId, page: page, size: size}}
    );
  }

  public getLocationDetails(locationId: string): Observable<LocationDetailsDTO> {
    return this._http.get<LocationDetailsDTO>(
      `${environment.apiBaseUrl}/locations/${locationId}`
    );
  }

  public deleteLocation(locationId: string): Observable<void> {
    return this._http.delete<void>(`${environment.apiBaseUrl}/locations/${locationId}`);
  }
}
