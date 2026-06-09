import {Component, computed, inject, OnInit, Signal, signal, WritableSignal} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {finalize} from "rxjs";
import {TranslatePipe} from "@ngx-translate/core";
import {CharacterSheetService, ICharacterSheetService} from "../../../services/character-sheet.service";
import {
  CharacterSheetDTO,
  CharacterSheetResponseDTO
} from "../../../interface/dtos/characterSheet/CharacterSheetDTO";
import {RedSunSheetResponseDTO} from "../../../interface/dtos/characterSheet/RedSunSheetResponseDTO";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {TalesContextService} from "../../../stateServices/tales-context.service";
import {TaleParticipantProfileDTO} from "../../../interface/dtos/tale/TaleParticipantProfileDTO";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";
import {RsAvatar} from "../../shared/fragments/rsAvatar/rs.avatar";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {EVariant} from "../../../interface/enums/EVariant";
import {RedSunSheetComponent} from "../manage-character/redsun-sheet/redsun-sheet.component";
import {TaleAccessRole} from "../../../interface/enums/TaleAccessRole";
import {RsRoundIconButton} from "../../shared/fragments/rsRoundIconButton/rs.round-icon-button";

@Component({
  selector: "rs-tale-participant-profile",
  standalone: true,
  imports: [
    TranslatePipe,
    RsViewHeader,
    RsSpinner,
    RsAvatar,
    RsButton,
    RedSunSheetComponent,
    RsRoundIconButton
  ],
  templateUrl: "./tale-participant-profile.view.html",
  styleUrl: "./tale-participant-profile.view.scss"
})
export class TaleParticipantProfileView implements OnInit {
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);
  private readonly _characterSheetService: ICharacterSheetService = inject(CharacterSheetService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _talesContext: TalesContextService = inject(TalesContextService);

  private readonly taleId: string | null = this._route.snapshot.paramMap.get(ROUTE_PATHS.taleId);
  protected readonly participantId: string | null = this._route.snapshot.paramMap.get(ROUTE_PATHS.id);
  protected readonly sheet: WritableSignal<CharacterSheetDTO | null> = signal<CharacterSheetDTO | null>(null);
  protected readonly isLoading: WritableSignal<boolean> = signal<boolean>(true);
  protected readonly EVariant = EVariant;
  protected readonly canEdit: Signal<boolean> = computed(() =>
    this._talesContext.role() === TaleAccessRole.Owner && !!this.sheet() && !!this.participantId
  );
  protected readonly participant: Signal<TaleParticipantProfileDTO | null> = computed(() => {
    const participantId = this.participantId;
    if (!participantId) {
      return null;
    }

    return this._talesContext.participants().find((participant) => participant.id === participantId) ?? null;
  });
  protected readonly displayName: Signal<string> = computed(() => {
    const sheetName = this.sheet()?.characterName?.trim() ?? "";
    if (sheetName.length > 0) {
      return sheetName;
    }

    const participant = this.participant();
    const participantName = participant?.characterName?.trim() ?? "";
    return participantName.length > 0 ? participantName : participant?.username ?? "";
  });
  protected readonly avatarSrc: Signal<string | null> = computed(() =>
    this.sheet()?.characterImageUrl ?? this.participant()?.characterImageUrl ?? null
  );
  protected readonly description: Signal<string> = computed(() =>
    this.sheet()?.characterDescription?.trim() ?? ""
  );
  protected readonly redSunSheet: Signal<RedSunSheetResponseDTO | null> = computed(() => {
    const sheet = this.sheet();
    return this.isRedSunSheet(sheet) ? sheet : null;
  });

  public ngOnInit(): void {
    if (!this.taleId || !this.participantId) {
      this.isLoading.set(false);
      return;
    }

    this._characterSheetService.getCharacterSheet(this.taleId, this.participantId).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: CharacterSheetResponseDTO) => this.sheet.set(response.sheet),
      error: (err: unknown) => {
        this.sheet.set(null);
        this._printer.error("failed to load tale participant profile", err);
      }
    });
  }

  protected onVisitUserProfile(): void {
    if (!this.participantId) {
      return;
    }

    void this._router.navigate(["/", ROUTE_PATHS.contacts, ROUTE_PATHS.details, this.participantId]);
  }

  protected onEditCharacterSheet(): void {
    if (!this.taleId || !this.participantId || !this.canEdit()) {
      return;
    }

    void this._router.navigate(["/", ROUTE_PATHS.tales, this.taleId, ROUTE_PATHS.profile, this.participantId]);
  }

  private isRedSunSheet(sheet: CharacterSheetDTO | null): sheet is RedSunSheetResponseDTO {
    return sheet !== null
      && "strength" in sheet
      && "willpowerMax" in sheet
      && "combatManeuvers" in sheet;
  }
}
