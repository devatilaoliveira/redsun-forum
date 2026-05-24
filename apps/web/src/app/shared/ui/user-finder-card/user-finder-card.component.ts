import {Component, computed, input, InputSignal, output, OutputEmitterRef, Signal} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";
import {UserFinderResultDTO} from "../../../../interface/dtos/user/UserFinderResultDTO";
import {EVariant} from "../../../../interface/enums/EVariant";
import {RsAvatar} from "../../fragments/rsAvatar/rs.avatar";
import {RsBadge} from "../../fragments/rsBadge/rs.badge";
import {RsButton} from "../../fragments/rsButton/rs.button";
import {RsDivider} from "../../fragments/rsDivider/rs.divider";
import {RsMoreOption, RsMoreOptions} from "../../fragments/rsMoreOptions/rs.more-options";

@Component({
  selector: "rs-user-finder-card",
  standalone: true,
  imports: [TranslatePipe, RsAvatar, RsBadge, RsButton, RsDivider, RsMoreOptions],
  templateUrl: "./user-finder-card.component.html",
  styleUrl: "./user-finder-card.component.scss"
})
export class UserFinderCardComponent {
  public readonly user: InputSignal<UserFinderResultDTO> = input.required<UserFinderResultDTO>();
  public readonly inProgress: InputSignal<boolean> = input<boolean>(false);
  public readonly alreadyContact: InputSignal<boolean> = input<boolean>(false);
  public readonly currentUser: InputSignal<boolean> = input<boolean>(false);
  public readonly menuOptions: InputSignal<RsMoreOption[]> = input<RsMoreOption[]>([]);

  public readonly addContactPressed: OutputEmitterRef<UserFinderResultDTO> = output<UserFinderResultDTO>();
  public readonly menuOptionSelected: OutputEmitterRef<RsMoreOption> = output<RsMoreOption>();

  protected readonly EVariant = EVariant;
  protected readonly roleCount: Signal<number> = computed<number>(() => this.user().favoriteRole?.length ?? 0);
  protected readonly ruleCount: Signal<number> = computed<number>(() => this.user().favoriteRules?.length ?? 0);
  protected readonly languageCount: Signal<number> = computed<number>(() => this.user().favoriteLanguage?.length ?? 0);
  protected readonly hasMenuOptions: Signal<boolean> = computed<boolean>(() => this.menuOptions().length > 0);

  protected onAddContactPressed(): void {
    if (this.currentUser() || this.alreadyContact() || this.inProgress()) {
      return;
    }

    this.addContactPressed.emit(this.user());
  }

  protected onMenuOptionSelected(option: RsMoreOption): void {
    this.menuOptionSelected.emit(option);
  }
}
