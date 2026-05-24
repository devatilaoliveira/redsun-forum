export interface LocationCreateRequestDTO {
  taleId: string;
  locationName: string;
  description: string;
  image?: File | null;
}
