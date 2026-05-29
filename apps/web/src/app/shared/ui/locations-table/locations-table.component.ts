import {Component, computed, effect, inject, input, InputSignal, Signal, signal, WritableSignal} from "@angular/core";
import {DatePipe} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import {Router} from "@angular/router";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {LocationDTO} from "../../../../interface/dtos/location/LocationDTO";
import {RsMoreOption, RsMoreOptions} from "../../fragments/rsMoreOptions/rs.more-options";
import {ILocationService, LocationService} from "../../../../services/location.service";
import {IPrinter, Printer} from "../../../../infra/miscellaneous/printer.handler";
import {LocalStoreService} from "../../../../services/local-store.service";
import {MeResponseDTO} from "../../../../interface/dtos/user/MeResponseDTO";
import {EAction} from "../../../../interface/enums/EAction";
import {RsDialogModalComponent, RsDialogCta} from "../dialog-modal/dialog-modal.component";
import {EVariant} from "../../../../interface/enums/EVariant";
import {TaleAccessRole} from "../../../../interface/enums/TaleAccessRole";
import {TalesContextService} from "../../../../stateServices/tales-context.service";

@Component({
  selector: "rs-locations-table",
  standalone: true,
  imports: [DatePipe, TranslatePipe, RsMoreOptions, RsDialogModalComponent],
  templateUrl: "./locations-table.component.html",
  styleUrl: "./locations-table.component.scss"
})
export class LocationsTableComponent {
  private readonly _router: Router = inject(Router);
  private readonly _locationService: ILocationService = inject(LocationService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _localStoreService: LocalStoreService = inject(LocalStoreService);
  private readonly _talesContext: TalesContextService | null = inject(TalesContextService, {optional: true});

  public readonly locations: InputSignal<LocationDTO[]> = input<LocationDTO[]>([]);
  public readonly taleId: InputSignal<string | null> = input<string | null>(null);

  protected readonly user: Signal<MeResponseDTO | null> = this._localStoreService.user;
  protected readonly EAction = EAction;
  protected readonly locationsState: WritableSignal<LocationDTO[]> = signal<LocationDTO[]>([]);
  protected readonly hasLocations: Signal<boolean> = computed<boolean>(() => this.locationsState().length > 0);
  protected readonly confirmDeleteOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly pendingDeleteLocation: WritableSignal<LocationDTO | null> = signal<LocationDTO | null>(null);
  protected readonly pendingDeleteIndex: WritableSignal<number> = signal<number>(-1);
  protected readonly cancelCta: RsDialogCta = {label: "Cancel", variant: EVariant.PRIMARY};
  protected readonly confirmDeleteCta: RsDialogCta = {label: "Confirm deletion", variant: EVariant.DANGER};

  constructor() {
    effect(() => {
      this.locationsState.set(this.locations());
    });
  }

  protected onLocationPressed(location: LocationDTO): void {
    if (!location?.id) return;
    const taleId = this.taleId();
    if (!taleId) return;
    void this._router.navigate(
      ["/", ROUTE_PATHS.tales, taleId, ROUTE_PATHS.locations, location.id],
      {state: {location}}
    );
  }

  protected canDeleteLocation(location: LocationDTO): boolean {
    const currentUser: MeResponseDTO | null = this.user();
    if (!currentUser) {
      return false;
    }

    const isTaleOwner = this._talesContext?.role() === TaleAccessRole.Owner;
    return currentUser.id === location.authorId || isTaleOwner;
  }

  protected onOptionSelected(location: LocationDTO, index: number, option: RsMoreOption): void {
    if (!location?.id) return;
    if (option.action === EAction.DELETE && !this.canDeleteLocation(location)) return;

    switch (option.action) {
    case EAction.DELETE: {
      this.openDeleteConfirm(location, index);
      break;
    }
    default:
      break;
    }
  }

  protected openDeleteConfirm(location: LocationDTO, index: number): void {
    this.pendingDeleteLocation.set(location);
    this.pendingDeleteIndex.set(index);
    this.confirmDeleteOpen.set(true);
  }

  protected closeDeleteConfirm(): void {
    this.confirmDeleteOpen.set(false);
    this.pendingDeleteLocation.set(null);
    this.pendingDeleteIndex.set(-1);
  }

  protected confirmDeleteLocation(): void {
    const location = this.pendingDeleteLocation();
    const index = this.pendingDeleteIndex();
    if (!location?.id) return;
    if (index < 0) return;

    this._locationService.deleteLocation(location.id).subscribe({
      next: () => {
        const items = this.locationsState();
        if (index < 0 || index >= items.length) {
          this.closeDeleteConfirm();
          return;
        }

        if (items[index]?.id !== location.id) {
          this.closeDeleteConfirm();
          return;
        }

        const nextItems = items.slice();
        nextItems.splice(index, 1);
        this.locationsState.set(nextItems);
        this._talesContext?.refreshTale();
        this.closeDeleteConfirm();
      },
      error: (err) => {
        this._printer.error("failed to delete location", err);
      }
    });
  }
}
