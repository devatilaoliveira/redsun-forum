import {DestroyRef, inject, Injectable, Signal} from "@angular/core";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {catchError, distinctUntilChanged, EMPTY, filter, finalize, map, startWith, switchMap, tap} from "rxjs";
import {TaleDetailDTO} from "../interface/dtos/tale/TaleDetailDTO";
import {TaleParticipantProfileDTO} from "../interface/dtos/tale/TaleParticipantProfileDTO";
import {TaleAccessRole} from "../interface/enums/TaleAccessRole";
import {ITaleService, TaleService} from "../services/tale.service";
import {TaleContextStateService} from "./tale-context-state.service";

@Injectable()
export class TalesContextService {
  private readonly _router: Router = inject(Router);
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _taleService: ITaleService = inject(TaleService);
  private readonly _taleState: TaleContextStateService = inject(TaleContextStateService);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private activeTaleId: string | null = null;

  public readonly taleId: Signal<string | null> = this._taleState.taleId;
  public readonly tale: Signal<TaleDetailDTO | null> = this._taleState.tale;
  public readonly participants: Signal<TaleParticipantProfileDTO[]> = this._taleState.participants;
  public readonly owner: Signal<TaleParticipantProfileDTO | null> = this._taleState.owner;
  public readonly role: Signal<TaleAccessRole> = this._taleState.role;
  public readonly isLoading: Signal<boolean> = this._taleState.isLoading;

  constructor() {
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.extractActiveTaleId()),
      distinctUntilChanged(),
      tap((taleId: string | null) => {
        this.activeTaleId = taleId;
        this._taleState.startLoading(taleId);
      }),
      switchMap((taleId: string | null) => {
        if (!taleId) {
          return EMPTY;
        }

        return this._taleService.getTale(taleId).pipe(
          finalize(() => this._taleState.setLoading(false)),
          catchError(() => {
            this._taleState.clearTale(taleId);
            return EMPTY;
          })
        );
      }),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe((tale: TaleDetailDTO) => {
      this.setTale(tale);
    });

    this._destroyRef.onDestroy(() => {
      this._taleState.clearIfCurrent(this.activeTaleId);
    });
  }

  public setTale(tale: TaleDetailDTO): void {
    this._taleState.setTale(tale);
  }

  public refreshTale(): void {
    const taleId = this._taleState.taleId();
    if (!taleId) {
      return;
    }

    this._taleState.setLoading(true);
    this._taleService.getTale(taleId).pipe(
      finalize(() => this._taleState.setLoading(false)),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe({
      next: (tale) => this.setTale(tale),
      error: () => {
        this._taleState.clearTale(taleId);
      }
    });
  }

  private extractActiveTaleId(): string | null {
    const route: ActivatedRoute = this.getDeepestRoute(this._activatedRoute);
    return route.snapshot.paramMap.get("taleId");
  }

  private getDeepestRoute(route: ActivatedRoute): ActivatedRoute {
    let current: ActivatedRoute = route;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }
}
