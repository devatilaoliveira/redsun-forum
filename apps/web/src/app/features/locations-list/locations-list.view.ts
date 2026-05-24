import {
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  ViewChild,
  WritableSignal
} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {finalize} from "rxjs";
import {LocationsTableComponent} from "../../shared/ui/locations-table/locations-table.component";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {EVariant} from "../../../interface/enums/EVariant";
import {ILocationService, LocationService} from "../../../services/location.service";
import {LocationDTO} from "../../../interface/dtos/location/LocationDTO";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {TaleAccessRole} from "../../../interface/enums/TaleAccessRole";
import {TalesContextService} from "../../../stateServices/tales-context.service";

@Component({
  selector: "rs-locations-list",
  standalone: true,
  imports: [TranslatePipe, LocationsTableComponent, RsButton, RsSpinner, RsViewHeader],
  templateUrl: "./locations-list.view.html",
  styleUrl: "./locations-list.view.scss"
})
export class LocationsListView implements OnInit, OnDestroy {
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);
  private readonly _locationService: ILocationService = inject(LocationService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _talesContext: TalesContextService = inject(TalesContextService);
  private readonly loadMoreObserver: IntersectionObserver | null = typeof IntersectionObserver === "undefined"
    ? null
    : new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.tryLoadMore();
        }
      },
      {root: null, rootMargin: "0px 0px", threshold: 0}
    );

  private hasObservedTrigger = false;
  private loadMoreTriggerElement: HTMLElement | null = null;

  @ViewChild("loadMoreTrigger")
  set loadMoreTrigger(element: ElementRef<HTMLElement> | undefined) {
    if (!element || !this.loadMoreObserver || this.hasObservedTrigger) {
      return;
    }

    this.loadMoreTriggerElement = element.nativeElement;
    this.loadMoreObserver.observe(element.nativeElement);
    this.hasObservedTrigger = true;
  }

  protected readonly taleId: string | null = this._route.snapshot.paramMap.get(ROUTE_PATHS.taleId);
  protected readonly isLoading: WritableSignal<boolean> = signal(false);
  protected readonly isLoadingMore: WritableSignal<boolean> = signal(false);
  protected readonly locations: WritableSignal<LocationDTO[]> = signal<LocationDTO[]>([]);
  protected readonly totalLocations: WritableSignal<number | null> = signal<number | null>(null);
  protected readonly nextPage: WritableSignal<number> = signal(0);
  protected readonly canCreateLocation: Signal<boolean> = computed(() => {
    const role = this._talesContext.role();
    return role === TaleAccessRole.Owner || role === TaleAccessRole.Participant;
  });
  protected readonly EVariant = EVariant;
  protected readonly loadedCount: Signal<number> = computed(() => this.locations().length);
  protected readonly totalCount: Signal<number> = computed(() => this.totalLocations() ?? this.locations().length);

  private readonly pageSize = 10;

  public ngOnInit(): void {
    if (!this.taleId) {
      return;
    }

    this.fetchLocations(this.taleId, 0, false);
  }

  public ngOnDestroy(): void {
    this.loadMoreObserver?.disconnect();
  }

  private tryLoadMore(): void {
    if (!this.taleId || this.isLoading() || this.isLoadingMore()) {
      return;
    }

    const total = this.totalLocations();
    const loaded = this.locations().length;
    if (total != null && loaded >= total) {
      return;
    }

    this.fetchLocations(this.taleId, this.nextPage(), true);
  }

  private fetchLocations(taleId: string, page: number, append: boolean): void {
    if (append) {
      this.isLoadingMore.set(true);
    } else {
      this.isLoading.set(true);
    }

    this._locationService.listLocations(taleId, page, this.pageSize).pipe(
      finalize(() => {
        if (append) {
          this.isLoadingMore.set(false);
        } else {
          this.isLoading.set(false);
        }
      })
    ).subscribe({
      next: (pageData) => {
        const merged = append ? [...this.locations(), ...pageData.content] : pageData.content;
        this.locations.set(merged);
        this.totalLocations.set(pageData.page.totalElements);
        this.nextPage.set(pageData.page.number + 1);

        if (append && pageData.content.length === 0) {
          this.totalLocations.set(merged.length);
        }

        if (this.loadMoreObserver && this.loadMoreTriggerElement) {
          this.loadMoreObserver.unobserve(this.loadMoreTriggerElement);
          this.loadMoreObserver.observe(this.loadMoreTriggerElement);
        }
      },
      error: (err) => {
        this._printer.error("failed to load locations", err);
      }
    });
  }

  protected async navigateToCreateLocation(): Promise<void> {
    const taleId = this._route.snapshot.paramMap.get(ROUTE_PATHS.taleId);
    if (!taleId) {
      return;
    }

    void this._router.navigate(["/", ROUTE_PATHS.tales, taleId, ROUTE_PATHS.locations, ROUTE_PATHS.creation]);
  }
}
