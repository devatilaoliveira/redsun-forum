import {inject, Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from "@angular/router";
import {catchError, map, Observable, of} from "rxjs";
import {ITaleService, TaleService} from "../../services/tale.service";
import {LocalStoreService} from "../../services/local-store.service";
import {ROUTE_PATHS} from "../../interface/constants/route-path.constants";

@Injectable({providedIn: "root"})
export class TaleParticipantGuard implements CanActivate {
  private readonly _router: Router = inject(Router);
  private readonly _taleService: ITaleService = inject(TaleService);
  private readonly _localStore: LocalStoreService = inject(LocalStoreService);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const taleId = route.paramMap.get("taleId");
    if (!taleId) {
      return of(this._router.createUrlTree([ROUTE_PATHS.home]));
    }

    // TODO: Re-enable getTaleCached when tale cache invalidation covers character avatar updates.
    // return this._taleService.getTaleCached(taleId).pipe(
    return this._taleService.getTale(taleId).pipe(
      map((tale) => {
        const currentUser = this._localStore.user();
        if (!currentUser?.id) {
          return this._router.createUrlTree([ROUTE_PATHS.home]);
        }
        const isOwner = tale.author?.id === currentUser.id;
        const isParticipant = (tale.participants ?? []).some((participant) => participant.id === currentUser.id);
        if (!isOwner && !isParticipant) {
          return this._router.createUrlTree([ROUTE_PATHS.home]);
        }
        return true;
      }),
      catchError(() => of(this._router.createUrlTree([ROUTE_PATHS.home])))
    );
  }
}
