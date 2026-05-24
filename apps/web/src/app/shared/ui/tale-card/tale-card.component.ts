import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {DatePipe} from "@angular/common";
import {TranslatePipe} from "@ngx-translate/core";
import {RsBadge} from "../../fragments/rsBadge/rs.badge";
import {EVariant} from "../../../../interface/enums/EVariant";
import {UtilFunctions} from "../../../../infra/miscellaneous/util.functions";
import {RsBoxClickable} from "../../fragments/rsBoxClickable/rs.box-clickable";
import {TaleResponseDTO} from "../../../../interface/dtos/tale/TaleResponseDTO";

@Component({
  selector: "rs-tale-card",
  standalone: true,
  imports: [DatePipe, TranslatePipe, RsBadge, RsBoxClickable],
  templateUrl: "./tale-card.component.html",
  styleUrl: "./tale-card.component.scss"
})
export class TaleCardComponent implements OnInit {
  @Input({required: true}) public tale!: TaleResponseDTO;
  @Output() public readonly pressed: EventEmitter<string> = new EventEmitter<string>();

  protected badgeLabelKey!: string;
  protected badgeVariant!: EVariant;
  protected participantsCount!: number;
  protected hasImage!: boolean;
  protected initials!: string;
  protected imageLoaded = false;
  protected readonly EVariant = EVariant;

  ngOnInit(): void {
    const tale: TaleResponseDTO = this.tale;

    this.badgeLabelKey = tale.isPublic ? "TALE_PUBLIC" : "TALE_PRIVATE";
    this.badgeVariant = tale.isPublic ? EVariant.PRIMARY : EVariant.WARNING;
    this.participantsCount = tale.participantsCount ?? 0;

    const url: string | null = tale.imageUrl;
    this.hasImage = !!url && url.trim().length > 0;
    this.initials = UtilFunctions.getInitials(tale.taleName);
    this.imageLoaded = false;
  }

  protected onCardPressed(): void {
    this.pressed.emit(this.tale.id);
  }

  protected onImageLoad(): void {
    this.imageLoaded = true;
  }
}
