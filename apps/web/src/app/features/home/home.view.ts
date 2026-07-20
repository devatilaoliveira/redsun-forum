import {Component, effect, inject, signal, Signal, WritableSignal} from "@angular/core";
import {LocalStoreService} from "../../../services/local-store.service";
import {MeResponseDTO} from "../../../interface/dtos/user/MeResponseDTO";
import {TranslatePipe} from "@ngx-translate/core";
import {RsAvatar} from "../../shared/fragments/rsAvatar/rs.avatar";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {ITaleService, TaleService} from "../../../services/tale.service";
import {TaleResponseDTO} from "../../../interface/dtos/tale/TaleResponseDTO";
import {TaleCardComponent} from "../../shared/ui/tale-card/tale-card.component";
import {Router} from "@angular/router";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";

@Component({
  selector: "rs-home",
  standalone: true,
  imports: [
    TranslatePipe,
    RsAvatar,
    RsViewHeader,
    TaleCardComponent,
  ],
  templateUrl: "./home.view.html",
  styleUrl: "./home.view.scss"
})
export class HomeView {
  private readonly _localStoreService: LocalStoreService = inject(LocalStoreService);
  private readonly _taleService: ITaleService = inject(TaleService);
  private readonly _router: Router = inject(Router);
  private readonly _printer: IPrinter = inject(Printer);

  protected user: Signal<MeResponseDTO | null> = this._localStoreService.user;
  protected readonly favoriteTale: WritableSignal<TaleResponseDTO | null> = signal<TaleResponseDTO | null>(null);

  constructor() {
    effect((onCleanup) => {
      const favoriteTaleId = this.user()?.userSettings.favoriteTaleId ?? null;
      this.favoriteTale.set(null);
      if (!favoriteTaleId) return;

      const subscription = this._taleService.getTaleCached(favoriteTaleId).subscribe({
        next: (tale) => {
          this.favoriteTale.set({
            id: tale.id,
            taleName: tale.taleName,
            isPublic: tale.isPublic,
            description: tale.description,
            language: tale.language,
            status: tale.status,
            imageUrl: tale.imageUrl,
            rules: tale.rules,
            creationDate: tale.creationDate,
            lastTimeActive: tale.lastTimeActive,
            participantsCount: tale.participants.length
          });
        },
        error: (error) => this._printer.error("failed to load favorite tale", error)
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  protected onFavoriteTalePressed(taleId: string): void {
    if (!taleId) return;
    void this._router.navigate(["/", ROUTE_PATHS.tales, taleId]);
  }
}
