import {Component, inject, signal, WritableSignal} from "@angular/core";
import {Router} from "@angular/router";
import {ITaleService, TaleService} from "../../../services/tale.service";
import {finalize} from "rxjs";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";
import {EVariant} from "../../../interface/enums/EVariant";
import {TranslatePipe} from "@ngx-translate/core";
import {TaleDetailsCardComponent} from "../../shared/ui/tale-details-card/tale-details-card.component";
import {LocationsTableComponent} from "../../shared/ui/locations-table/locations-table.component";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsCarousel} from "../../shared/fragments/rsCarousel/rs.carousel";
import {RsContactCard} from "../../shared/fragments/rsContactCard/rs.contact-card";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {TalesContextService} from "../../../stateServices/tales-context.service";

@Component({
  selector: "rs-tale-details",
  standalone: true,
  imports: [
    RsSpinner,
    TranslatePipe,
    TaleDetailsCardComponent,
    LocationsTableComponent,
    RsButton,
    RsCarousel,
    RsContactCard
  ],
  templateUrl: "./tale-details.view.html",
  styleUrl: "./tale-details.view.scss"
})
export class TaleDetailsView {
  private readonly _taleService: ITaleService = inject(TaleService);
  private readonly _router: Router = inject(Router);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _talesContext: TalesContextService = inject(TalesContextService);

  protected readonly inviteIdentifier: WritableSignal<string> = signal("");
  protected readonly inviteInProgress: WritableSignal<boolean> = signal(false);
  protected readonly tale = this._talesContext.tale;
  protected readonly isLoading = this._talesContext.isLoading;

  protected async navigateToListofLocations(): Promise<void> {
    const taleId = this._talesContext.taleId();
    if (!taleId) {
      return;
    }

    void this._router.navigate(["/", ROUTE_PATHS.tales, taleId, ROUTE_PATHS.locations]);
  }

  // Dev Mode Only
  protected onInviteIdentifierChange(value: string): void {
    this.inviteIdentifier.set(value);
  }

  protected onAddParticipant(taleId: string): void {
    const identifier = this.inviteIdentifier().trim();
    if (!identifier || this.inviteInProgress()) {
      return;
    }

    this.inviteInProgress.set(true);
    this._taleService.addParticipantByIdentifier(taleId, identifier).pipe(
      finalize(() => this.inviteInProgress.set(false))
    ).subscribe({
      next: (tale) => {
        this.inviteIdentifier.set("");
        this._talesContext.setTale(tale);
      },
      error: (err) => {
        this._printer.error("failed to add tale participant by identifier", err);
      }
    });
  }

  protected readonly EVariant = EVariant;
}
