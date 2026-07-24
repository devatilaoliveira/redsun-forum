import {inject, Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from "@angular/router";
import {catchError, map, Observable, of} from "rxjs";
import {ROUTE_PATHS} from "../../interface/constants/route-path.constants";
import {ITaleService, TaleService} from "../../services/tale.service";

@Injectable({providedIn: "root"})
export class TaleViewerGuard implements CanActivate {
  private readonly _router: Router = inject(Router);
  private readonly _taleService: ITaleService = inject(TaleService);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const taleId = route.paramMap.get(ROUTE_PATHS.taleId);
    const participantId = route.paramMap.get(ROUTE_PATHS.id);
    if (!taleId || !participantId) {
      return of(this._router.createUrlTree([ROUTE_PATHS.home]));
    }

    return this._taleService.getTale(taleId).pipe(
      map((tale) => {
        const isTaleMember = tale.author?.id === participantId
          || (tale.participants ?? []).some((participant) => participant.id === participantId);
        if (!isTaleMember) {
          return this._router.createUrlTree(["/", ROUTE_PATHS.tales, taleId]);
        }

        return true;
      }),
      catchError(() => of(this._router.createUrlTree([ROUTE_PATHS.home])))
    );
  }
}
