import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {DatePipe} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import {RsBadge} from "../../fragments/rsBadge/rs.badge";
import {EVariant} from "../../../../interface/enums/EVariant";
import {UtilFunctions} from "../../../../infra/miscellaneous/util.functions";
import {RsBoxClickable} from "../../fragments/rsBoxClickable/rs.box-clickable";
import {TaleResponseDTO} from "../../../../interface/dtos/tale/TaleResponseDTO";
import {RsDivider} from "../../fragments/rsDivider/rs.divider";
import {ETheme} from "../../../../interface/enums/ETheme";
import {RsDot} from "../../fragments/rsDot/rs.dot";
import {RsTooltip} from "../../fragments/rsTooltip/rs.tooltip";
import {RsImg} from "../../fragments/rsImg/rs.img";

@Component({
  selector: "rs-tale-card",
  standalone: true,
  imports: [DatePipe, TranslatePipe, RsBadge, RsBoxClickable, RsDivider, RsDot, RsTooltip, RsImg],
  templateUrl: "./tale-card.component.html",
  styleUrl: "./tale-card.component.scss"
})
export class TaleCardComponent implements OnInit {
  @Input({required: true}) public tale!: TaleResponseDTO;
  @Output() public readonly pressed: EventEmitter<string> = new EventEmitter<string>();

  protected badgeLabelKey!: string;
  protected badgeVariant!: EVariant;
  protected visibilityIconSrc!: string;
  protected participantsCount!: number;
  protected lastActiveVariant!: EVariant;
  protected hasImage!: boolean;
  protected initials!: string;
  protected readonly EVariant = EVariant;
  protected readonly ETheme = ETheme;

  ngOnInit(): void {
    const tale: TaleResponseDTO = this.tale;

    this.badgeLabelKey = tale.isPublic ? "TALE_PUBLIC" : "TALE_PRIVATE";
    this.badgeVariant = tale.isPublic ? EVariant.PRIMARY : EVariant.WARNING;
    this.visibilityIconSrc = tale.isPublic ? "/assets/svgs/language.svg" : "/assets/svgs/lock.svg";
    this.participantsCount = tale.participantsCount ?? 0;
    this.lastActiveVariant = UtilFunctions.getVariantByDate(tale.lastTimeActive);

    const url: string | null = tale.imageUrl;
    this.hasImage = !!url && url.trim().length > 0;
    this.initials = UtilFunctions.getInitials(tale.taleName);
  }

  protected onCardPressed(): void {
    this.pressed.emit(this.tale.id);
  }
}
