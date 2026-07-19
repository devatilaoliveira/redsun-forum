import {Component, computed, inject, input, InputSignal} from "@angular/core";
import {DatePipe} from "@angular/common";
import {Router} from "@angular/router";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {EVariant} from "../../../../interface/enums/EVariant";
import {UtilFunctions} from "../../../../infra/miscellaneous/util.functions";
import {RsBox} from "../../fragments/rsBox/rs.box";
import {TaleDetailDTO} from "../../../../interface/dtos/tale/TaleDetailDTO";
import {RsDivider} from "../../fragments/rsDivider/rs.divider";
import {ETheme} from "../../../../interface/enums/ETheme";
import {RsDot} from "../../fragments/rsDot/rs.dot";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {LocationDTO} from "../../../../interface/dtos/location/LocationDTO";
import {RsImg} from "../../fragments/rsImg/rs.img";
import {RsExpandableText} from "../../fragments/rsExpandableText/rs.expandable-text";

@Component({
  selector: "rs-tale-details-card",
  standalone: true,
  imports: [DatePipe, TranslatePipe, RsBox, RsDivider, RsDot, RsImg, RsExpandableText],
  templateUrl: "./tale-details-card.component.html",
  styleUrl: "./tale-details-card.component.scss"
})
export class TaleDetailsCardComponent {
  private readonly _router: Router = inject(Router);
  private readonly _translateService: ITranslateService = inject(TranslateService);

  public readonly tale: InputSignal<TaleDetailDTO> = input.required<TaleDetailDTO>();

  protected readonly hasImage = computed<boolean>(() => {
    const url = this.tale().imageUrl;
    return !!url && url.trim().length > 0;
  });
  protected readonly initials = computed<string>(() =>
    UtilFunctions.getInitials(this.tale().taleName)
  );
  protected readonly ownerName = computed<string>(() => {
    const owner = this.tale().author;
    if (owner.isDeleted) {
      return this._translateService.instant("DELETED_USER");
    }

    const ownerName = owner.username;
    const trimmed = ownerName.trim();
    return trimmed.length > 0 ? trimmed : "-";
  });
  protected readonly latestActiveLocation = computed<LocationDTO | null>(() => {
    const locations = this.tale().locations;
    if (!locations.length) return null;

    return locations.reduce((latest, location) => {
      const latestTime = Date.parse(latest.lastTimeActive);
      const locationTime = Date.parse(location.lastTimeActive);
      if (Number.isNaN(locationTime)) return latest;
      if (Number.isNaN(latestTime)) return location;
      return locationTime > latestTime ? location : latest;
    }, locations[0]);
  });
  protected readonly lastActiveVariant = computed<EVariant>(() => UtilFunctions.getVariantByDate(this.tale().lastTimeActive));
  protected readonly EVariant = EVariant;
  protected readonly ETheme = ETheme;

  protected navigateToTaleOwner(): void {
    const ownerId = this.tale().author.id;
    if (!ownerId) return;
    void this._router.navigate(["/", ROUTE_PATHS.contacts, ROUTE_PATHS.details, ownerId]);
  }

  protected navigateToLatestActiveLocation(): void {
    const location = this.latestActiveLocation();
    if (!location?.id) return;
    void this._router.navigate(
      ["/", ROUTE_PATHS.tales, this.tale().id, ROUTE_PATHS.locations, location.id],
      {state: {location}}
    );
  }
}
