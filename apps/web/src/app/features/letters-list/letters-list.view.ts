import {Component, computed, inject, OnInit, Signal, signal, WritableSignal} from "@angular/core";
import {Router} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {finalize} from "rxjs";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";
import {RsRoundIconButton} from "../../shared/fragments/rsRoundIconButton/rs.round-icon-button";
import {RsTooltip} from "../../shared/fragments/rsTooltip/rs.tooltip";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {RsAvatar} from "../../shared/fragments/rsAvatar/rs.avatar";
import {ILetterService, LetterService} from "../../../services/letter.service";
import {LetterDTO} from "../../../interface/dtos/letter/LetterDTO";
import {UserAsContactDTO} from "../../../interface/dtos/user/UserAsContactDTO";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {EVariant} from "../../../interface/enums/EVariant";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";

type LettersBox = "received" | "sent";

@Component({
  selector: "rs-letters-list",
  standalone: true,
  imports: [TranslatePipe, RsSpinner, RsRoundIconButton, RsTooltip, RsViewHeader, RsAvatar],
  templateUrl: "./letters-list.view.html",
  styleUrl: "./letters-list.view.scss"
})
export class LettersListView implements OnInit {
  private readonly _letterService: ILetterService = inject(LetterService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _router: Router = inject(Router);

  protected readonly lettersState: WritableSignal<LetterDTO[]> = signal<LetterDTO[]>([]);
  protected readonly lettersBox: WritableSignal<LettersBox> = signal<LettersBox>("received");
  protected readonly isSent: Signal<boolean> = computed(() => this.lettersBox() === "sent");
  protected readonly hasLetters: Signal<boolean> = computed(() => this.lettersState().length > 0);
  protected readonly isLoading: WritableSignal<boolean> = signal(false);
  protected readonly EVariant = EVariant;

  public ngOnInit(): void {
    this.fetchLetters();
  }

  protected onShowReceived(): void {
    if (!this.isSent()) return;
    this.lettersBox.set("received");
    this.fetchLetters();
  }

  protected onShowSent(): void {
    if (this.isSent()) return;
    this.lettersBox.set("sent");
    this.fetchLetters();
  }

  protected onComposeLetter(): void {
    void this._router.navigate(["/", ROUTE_PATHS.contacts, ROUTE_PATHS.details, ROUTE_PATHS.letter]);
  }

  protected onLetterPressed(letter: LetterDTO): void {
    if (!letter?.id) return;
    void this._router.navigate(["/", ROUTE_PATHS.letters, letter.id], {state: {letter}});
  }

  protected getPrimaryContact(letter: LetterDTO): UserAsContactDTO | null {
    if (this.isSent()) {
      return letter.recipients?.[0] ?? null;
    }
    return letter.sender ?? null;
  }

  private fetchLetters(page: number = 0): void {
    this.isLoading.set(true);
    const request = this.isSent()
      ? this._letterService.listSentLetters(page)
      : this._letterService.listLetters(page);

    request.pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (pageData) => {
        this.lettersState.set(pageData.content ?? []);
      },
      error: (err) => {
        this._printer.error("failed to load letters", err);
      }
    });
  }
}
