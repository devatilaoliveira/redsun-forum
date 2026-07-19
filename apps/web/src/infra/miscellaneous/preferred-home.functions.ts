import {ROUTE_PATHS} from "../../interface/constants/route-path.constants";

export function resolvePreferredHomeUrl(
  redirectToFavorite: boolean,
  favoriteTaleId: string | null | undefined
): string {
  if (!redirectToFavorite || !favoriteTaleId) {
    return "/";
  }

  return `/${ROUTE_PATHS.tales}/${encodeURIComponent(favoriteTaleId)}`;
}
