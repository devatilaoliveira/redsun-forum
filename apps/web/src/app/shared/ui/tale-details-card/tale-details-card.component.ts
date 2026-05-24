import {Component, computed, input, InputSignal} from "@angular/core";
import {DatePipe} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import {RsBadge} from "../../fragments/rsBadge/rs.badge";
import {EVariant} from "../../../../interface/enums/EVariant";
import {UtilFunctions} from "../../../../infra/miscellaneous/util.functions";
import {RsBox} from "../../fragments/rsBox/rs.box";
import {TaleDetailDTO} from "../../../../interface/dtos/tale/TaleDetailDTO";

@Component({
  selector: "rs-tale-details-card",
  standalone: true,
  imports: [DatePipe, TranslatePipe, RsBadge, RsBox],
  templateUrl: "./tale-details-card.component.html",
  styleUrl: "./tale-details-card.component.scss"
})
export class TaleDetailsCardComponent {
  public readonly tale: InputSignal<TaleDetailDTO> = input.required<TaleDetailDTO>();
  protected imageLoaded = false;

  protected readonly hasImage = computed<boolean>(() => {
    const url = this.tale().imageUrl;
    return !!url && url.trim().length > 0;
  });
  protected readonly initials = computed<string>(() =>
    UtilFunctions.getInitials(this.tale().taleName)
  );
  protected readonly ownerName = computed<string>(() => {
    const ownerName = this.tale().author.username;
    const trimmed = ownerName.trim();
    return trimmed.length > 0 ? trimmed : "-";
  });
  protected readonly EVariant = EVariant;

  protected onImageLoad(): void {
    this.imageLoaded = true;
  }
}
