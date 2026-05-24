import {Component, computed, inject, OnInit, signal, WritableSignal} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsTextarea} from "../../shared/fragments/rsTextarea/rs.textarea";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {RsContactCard} from "../../shared/fragments/rsContactCard/rs.contact-card";
import {RsCarousel} from "../../shared/fragments/rsCarousel/rs.carousel";
import {LetterDTO} from "../../../interface/dtos/letter/LetterDTO";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {EVariant} from "../../../interface/enums/EVariant";
import {ILetterService, LetterService} from "../../../services/letter.service";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {LocalStoreService} from "../../../services/local-store.service";

type LetterReadFormGroup = FormGroup<{
  subject: FormControl<string>;
  content: FormControl<string>;
}>;

@Component({
  selector: "rs-letter-read",
  standalone: true,
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    RsInput,
    RsTextarea,
    RsButton,
    RsViewHeader,
    RsContactCard,
    RsCarousel
  ],
  templateUrl: "./letter-read.view.html",
  styleUrl: "./letter-read.view.scss"
})
export class LetterReadView implements OnInit {
  private readonly _fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _letterService: ILetterService = inject(LetterService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _localStoreService: LocalStoreService = inject(LocalStoreService);

  protected readonly letter: WritableSignal<LetterDTO | null> = signal<LetterDTO | null>(null);
  protected readonly isSentByCurrentUser = computed(() => {
    const currentUserId = this._localStoreService.user()!.id;
    const senderId = this.letter()?.sender?.id ?? null;

    return senderId === currentUserId;
  });
  protected readonly EVariant = EVariant;
  protected readonly letterFormGroup: LetterReadFormGroup = this._fb.group({
    subject: this._fb.control<string>(""),
    content: this._fb.control<string>("")
  });
  protected readonly letterControls = this.letterFormGroup.controls;

  public ngOnInit(): void {
    const letterId = this._route.snapshot.paramMap.get(ROUTE_PATHS.letterId);
    if (!letterId) {
      return;
    }

    this._letterService.getLetter(letterId).subscribe({
      next: (letter) => this.setLetter(letter),
      error: (err) => this._printer.error("failed to load letter", err)
    });
  }

  protected async onRespond(): Promise<void> {
    const senderId = this.letter()?.sender?.id;
    if (!senderId) {
      return;
    }

    void this._router.navigate(["/", ROUTE_PATHS.letter, ROUTE_PATHS.creation, senderId]);
  }

  private setLetter(letter: LetterDTO | null): void {
    this.letter.set(letter);
    if (!letter) {
      return;
    }

    this.letterControls.subject.setValue(letter.subject ?? "");
    this.letterControls.content.setValue(letter.content ?? "");
  }
}
