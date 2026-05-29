import {Component, computed, input, InputSignal, output, OutputEmitterRef, Signal} from "@angular/core";
import {RouterLink} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {UserFinderResultDTO} from "../../../../interface/dtos/user/UserFinderResultDTO";
import {EVariant} from "../../../../interface/enums/EVariant";
import {RsAvatar} from "../../fragments/rsAvatar/rs.avatar";
import {RsBadge} from "../../fragments/rsBadge/rs.badge";
import {RsBox} from "../../fragments/rsBox/rs.box";
import {RsButton} from "../../fragments/rsButton/rs.button";
import {RsMoreOption, RsMoreOptions} from "../../fragments/rsMoreOptions/rs.more-options";
import {RsDivider} from "../../fragments/rsDivider/rs.divider";

@Component({
  selector: "rs-user-finder-card",
  standalone: true,
  imports: [RouterLink, TranslatePipe, RsAvatar, RsBadge, RsBox, RsButton, RsMoreOptions, RsDivider],
  templateUrl: "./user-finder-card.component.html",
  styleUrl: "./user-finder-card.component.scss"
})
export class UserFinderCardComponent {
  public readonly user: InputSignal<UserFinderResultDTO> = input.required<UserFinderResultDTO>();
  public readonly inProgress: InputSignal<boolean> = input<boolean>(false);
  public readonly alreadyContact: InputSignal<boolean> = input<boolean>(false);
  public readonly menuOptions: InputSignal<RsMoreOption[]> = input<RsMoreOption[]>([]);

  public readonly addContactPressed: OutputEmitterRef<UserFinderResultDTO> = output<UserFinderResultDTO>();
  public readonly menuOptionSelected: OutputEmitterRef<RsMoreOption> = output<RsMoreOption>();

  protected readonly EVariant = EVariant;
  protected readonly hasMenuOptions: Signal<boolean> = computed<boolean>(() => this.menuOptions().length > 0);
  protected readonly profileRoute: Signal<string[]> = computed<string[]>(() => {
    return ["/", ROUTE_PATHS.contacts, ROUTE_PATHS.details, this.user().id];
  });

  protected onAddContactPressed(): void {
    this.addContactPressed.emit(this.user());
  }

  protected onMenuOptionSelected(option: RsMoreOption): void {
    this.menuOptionSelected.emit(option);
  }
}
