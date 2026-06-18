export interface LocationUpdateRequestDTO {
  locationName?: string | null;
  description?: string | null;
  image?: File | null;
  removeImage?: boolean | null;
}
