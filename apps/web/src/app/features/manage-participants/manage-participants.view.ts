import {Component, computed, inject, Signal, signal, WritableSignal} from "@angular/core";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {RsMoreOptions, RsMoreOption} from "../../shared/fragments/rsMoreOptions/rs.more-options";
import {EAction} from "../../../interface/enums/EAction";
import {UtilFunctions} from "../../../infra/miscellaneous/util.functions";
import {ActivatedRoute, Router} from "@angular/router";
import {ITaleService, TaleService} from "../../../services/tale.service";
import {finalize} from "rxjs";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";
import {EVariant} from "../../../interface/enums/EVariant";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {RsDialogModalComponent} from "../../shared/ui/dialog-modal/dialog-modal.component";
import {IToastService, ToastService} from "../../../services/toast.service";
import {TaleParticipantProfileDTO} from "../../../interface/dtos/tale/TaleParticipantProfileDTO";
import {TalesContextService} from "../../../stateServices/tales-context.service";
import {ERole} from "../../../interface/enums/ERole";

@Component({
  selector: "rs-manage-participants",
  standalone: true,
  imports: [TranslatePipe, RsMoreOptions, RsSpinner, RsInput, RsButton, RsViewHeader, RsDialogModalComponent],
  templateUrl: "./manage-participants.view.html",
  styleUrl: "./manage-participants.view.scss"
})
export class ManageParticipantsView {
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);
  private readonly _taleService: ITaleService = inject(TaleService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _toastService: IToastService = inject(ToastService);
  private readonly _talesContext: TalesContextService = inject(TalesContextService);
  private readonly taleId: string | null = this._route.snapshot.paramMap.get(ROUTE_PATHS.taleId);

  protected readonly participantsState: Signal<TaleParticipantProfileDTO[]> = this._talesContext.participants;
  protected readonly hasParticipants: Signal<boolean> = computed(() => this.participantsState().length > 0);
  protected readonly EAction = EAction;
  protected readonly EVariant = EVariant;
  protected readonly UtilFunctions = UtilFunctions;
  protected readonly isRemoving: WritableSignal<boolean> = signal(false);
  protected readonly isLoading: Signal<boolean> = this._talesContext.isLoading;
  protected readonly inviteIdentifier: WritableSignal<string> = signal("");
  protected readonly inviteInProgress: WritableSignal<boolean> = signal(false);
  protected readonly taleOwnerId: Signal<string | null> = computed(() => this._talesContext.owner()?.id ?? null);
  protected readonly transferDialogOpen: WritableSignal<boolean> = signal(false);
  protected readonly transferTarget: WritableSignal<TaleParticipantProfileDTO | null> = signal<TaleParticipantProfileDTO | null>(null);
  protected readonly transferUsernameValue: WritableSignal<string> = signal("");
  protected readonly transferInProgress: WritableSignal<boolean> = signal(false);
  protected readonly canConfirmTransfer: Signal<boolean> = computed(() => {
    const target = this.transferTarget();
    const typed = this.transferUsernameValue().trim();
    return !!target?.username && typed.length > 0 && typed === target.username;
  });

  protected onInviteIdentifierChange(value: string): void {
    this.inviteIdentifier.set(value);
  }

  protected onAddParticipant(): void {
    const taleId = this.taleId;
    const identifier = this.inviteIdentifier().trim();
    if (!taleId || !identifier || this.inviteInProgress()) {
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
        this.openToast(this._translateService.instant("PARTICIPANT_ADD_FAILED"));
        this._printer.error("failed to add participant by identifier", err);
      }
    });
  }

  protected onParticipantPressed(contact: TaleParticipantProfileDTO): void {
    if (!contact?.id) {
      return;
    }
    void this._router.navigate(["/", ROUTE_PATHS.contacts, ROUTE_PATHS.details, contact.id]);
  }

  protected onOptionSelected(contact: TaleParticipantProfileDTO, option: RsMoreOption): void {
    if (!contact?.id) return;
    switch (option.action) {
    case EAction.TRANSFER:
      this.openTransferDialog(contact);
      break;
    case EAction.DELETE:
      if (this.isTaleOwner(contact)) return;
      this.removeParticipant(contact);
      break;
    default:
      break;
    }
  }

  protected isTaleOwner(contact: TaleParticipantProfileDTO): boolean {
    const ownerId = this.taleOwnerId();
    return !!ownerId && contact?.id === ownerId;
  }

  protected characterName(contact: TaleParticipantProfileDTO): string {
    const characterName = contact.characterName?.trim() ?? "";
    return characterName.length > 0 ? characterName : "-";
  }

  protected characterInitials(contact: TaleParticipantProfileDTO): string {
    return UtilFunctions.getInitials(contact.characterName);
  }

  protected roleLabelKey(role: ERole): string {
    return `ROLE_${role}`;
  }

  protected openTransferDialog(contact: TaleParticipantProfileDTO): void {
    if (!contact?.id || this.isTaleOwner(contact) || this.transferInProgress()) return;
    this.transferTarget.set(contact);
    this.transferUsernameValue.set("");
    this.transferDialogOpen.set(true);
  }

  protected closeTransferDialog(force: boolean = false): void {
    if (!force && this.transferInProgress()) {
      return;
    }
    this.transferDialogOpen.set(false);
    this.transferTarget.set(null);
    this.transferUsernameValue.set("");
  }

  protected onTransferUsernameChange(value: string): void {
    this.transferUsernameValue.set(value);
  }

  protected confirmTransferOwnership(): void {
    const taleId = this.taleId;
    const target = this.transferTarget();
    if (!taleId || !target?.id) return;
    if (!this.canConfirmTransfer() || this.transferInProgress()) return;

    this.transferInProgress.set(true);
    this._taleService.transferOwnership(taleId, target.id).pipe(
      finalize(() => this.transferInProgress.set(false))
    ).subscribe({
      next: (tale) => {
        this._talesContext.setTale(tale);
        this.closeTransferDialog(true);
        void this._router.navigate(["/", ROUTE_PATHS.tales, taleId], {replaceUrl: true});
      },
      error: (err) => {
        this.openToast(this._translateService.instant("ASSIGN_TALE_OWNER_FAILED"));
        this._printer.error("failed to transfer tale ownership", err);
      }
    });
  }

  private removeParticipant(contact: TaleParticipantProfileDTO): void {
    const taleId = this.taleId;
    if (!taleId || this.isRemoving()) return;

    this.isRemoving.set(true);
    this._taleService.removeParticipantById(taleId, contact.id!).pipe(
      finalize(() => this.isRemoving.set(false))
    ).subscribe({
      next: (tale) => {
        this._talesContext.setTale(tale);
      },
      error: (err) => {
        this._printer.error("failed to remove participant", err);
      }
    });
  }

  private openToast(message: string): void {
    this._toastService.show({
      label: this._translateService.instant("ERROR"),
      message,
      variant: EVariant.DANGER
    });
  }
}
