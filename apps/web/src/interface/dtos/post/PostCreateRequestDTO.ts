import {EPostType} from "../../enums/EPostType";

export interface PostCreateRequestDTO {
  locationId: string;
  content: string;
  type: EPostType;
}
