import {Component, computed, input, InputSignal} from "@angular/core";
import {DatePipe} from "@angular/common";
import {RouterLink} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {RsBox} from "../../fragments/rsBox/rs.box";
import {LocationDetailsDTO} from "../../../../interface/dtos/location/LocationDetailsDTO";
import {RsAvatar} from "../../fragments/rsAvatar/rs.avatar";
import {RsImg} from "../../fragments/rsImg/rs.img";
import {RsExpandableText} from "../../fragments/rsExpandableText/rs.expandable-text";

@Component({
  selector: "rs-local-details-card",
  standalone: true,
  imports: [DatePipe, RouterLink, TranslatePipe, RsBox, RsAvatar, RsImg, RsExpandableText],
  templateUrl: "./local-details-card.component.html",
  styleUrl: "./local-details-card.component.scss"
})
export class LocalDetailsCardComponent {
  public readonly location: InputSignal<LocationDetailsDTO> = input.required<LocationDetailsDTO>();
  protected readonly locationImageSizes = "(max-width: 718px) 100%, 718px";

  protected readonly hasImage = computed<boolean>(() => {
    const url = this.location().imageUrl;
    return !!url && url.trim().length > 0;
  });
  protected readonly authorName = computed<string>(() => {
    const authorName = this.location().author?.characterName ?? "";
    const trimmed = authorName.trim();
    return trimmed.length > 0 ? trimmed : "-";
  });
  protected readonly authorProfileLink = computed<string[] | null>(() => {
    const location = this.location();
    const taleId = location.taleId;
    const participantId = location.author?.id;

    if (!taleId || !participantId) {
      return null;
    }

    return ["/", ROUTE_PATHS.tales, taleId, ROUTE_PATHS.participants, participantId];
  });
}
