import {Component, computed, effect, inject, input, InputSignal, output, OutputEmitterRef, signal} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";
import {PostDTO} from "../../../../interface/dtos/post/PostDTO";
import {EPostStatus} from "../../../../interface/enums/EPostStatus";
import {EVariant} from "../../../../interface/enums/EVariant";
import {ITimeDisplayHandler, TimeDisplayHandler} from "../../../../infra/miscellaneous/time-display.handler";
import {RsAvatar} from "../../fragments/rsAvatar/rs.avatar";
import {RsBadge} from "../../fragments/rsBadge/rs.badge";
import {RsMoreOption, RsMoreOptions} from "../../fragments/rsMoreOptions/rs.more-options";
import {RsRoundIconButton} from "../../fragments/rsRoundIconButton/rs.round-icon-button";

@Component({
  selector: "rs-post-details-card",
  standalone: true,
  imports: [TranslatePipe, RsAvatar, RsBadge, RsMoreOptions, RsRoundIconButton],
  templateUrl: "./post-details-card.component.html",
  styleUrl: "./post-details-card.component.scss"
})
export class PostDetailsCardComponent {
  private readonly _timeDisplayHandler: ITimeDisplayHandler = inject(TimeDisplayHandler);

  public readonly post: InputSignal<PostDTO> = input.required<PostDTO>();
  public readonly options: InputSignal<RsMoreOption[]> = input<RsMoreOption[]>([]);
  public readonly actionSelected: OutputEmitterRef<RsMoreOption> = output<RsMoreOption>();
  protected readonly EVariant = EVariant;
  protected readonly isContentVisible = signal<boolean>(false);

  private lastPostId: string | null = null;
  private lastInactive = false;

  private readonly resetContentVisibility = effect(() => {
    const currentId = this.post().id;
    const inactive = this.isInactive();

    if (currentId !== this.lastPostId || inactive !== this.lastInactive) {
      if (inactive) {
        this.isContentVisible.set(false);
      }
    }

    this.lastPostId = currentId;
    this.lastInactive = inactive;
  });

  protected readonly authorName = computed<string>(() => {
    const name = this.post().author?.characterName ?? "";
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed : "-";
  });

  protected readonly hasOptions = computed<boolean>(() => {
    return (this.options() ?? []).some((option) => (option?.text ?? "").trim().length > 0);
  });

  protected readonly isInactive = computed<boolean>(() => {
    return this.post().status === EPostStatus.INACTIVE;
  });

  protected readonly contentVisible = computed<boolean>(() => {
    return !this.isInactive() || this.isContentVisible();
  });

  protected readonly creationDateDisplay = computed<string>(() => {
    return this._timeDisplayHandler.display(this.post().creationDate, "relative");
  });

  protected toggleContentVisibility(): void {
    if (!this.isInactive()) {
      return;
    }

    this.isContentVisible.set(!this.isContentVisible());
  }

  protected onOptionSelected(option: RsMoreOption): void {
    this.actionSelected.emit(option);
  }
}
