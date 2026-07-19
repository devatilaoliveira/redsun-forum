import {Component, computed, inject, input, InputSignal, Signal, signal, WritableSignal} from "@angular/core";
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
import {AppSettingsService, IAppSettingsService} from "../../../../services/app-settings.service";
import {IUserProfileService, UserProfileService} from "../../../../services/user-profile.service";
import {finalize} from "rxjs";
import {RsDialogCta, RsDialogModalComponent} from "../dialog-modal/dialog-modal.component";
import {IPrinter, Printer} from "../../../../infra/miscellaneous/printer.handler";

type FavoriteDialogMode = "remove" | "replace";

@Component({
  selector: "rs-tale-details-card",
  standalone: true,
  imports: [DatePipe, TranslatePipe, RsBox, RsDivider, RsDot, RsImg, RsExpandableText, RsDialogModalComponent],
  templateUrl: "./tale-details-card.component.html",
  styleUrl: "./tale-details-card.component.scss"
})
export class TaleDetailsCardComponent {
  private readonly _router: Router = inject(Router);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _appSettingsService: IAppSettingsService = inject(AppSettingsService);
  private readonly _userProfileService: IUserProfileService = inject(UserProfileService);
  private readonly _printer: IPrinter = inject(Printer);

  public readonly tale: InputSignal<TaleDetailDTO> = input.required<TaleDetailDTO>();

  protected readonly favoriteTaleId: Signal<string | null> = this._appSettingsService.favoriteTaleId;
  protected readonly favoriteSaving: WritableSignal<boolean> = signal(false);
  protected readonly favoriteDialogMode: WritableSignal<FavoriteDialogMode | null> = signal(null);
  protected readonly isFavorite: Signal<boolean> = computed(() => this.favoriteTaleId() === this.tale().id);
  protected readonly favoriteLabel: Signal<string> = computed(() => {
    this._appSettingsService.language();
    return this._translateService.instant(this.isFavorite() ? "FAVORITE_TALE_REMOVE_LABEL" : "FAVORITE_TALE_ADD_LABEL");
  });
  protected readonly favoriteDialogTitle: Signal<string> = computed(() => {
    this._appSettingsService.language();
    return this._translateService.instant(
      this.favoriteDialogMode() === "remove" ? "FAVORITE_TALE_REMOVE_TITLE" : "FAVORITE_TALE_REPLACE_TITLE"
    );
  });
  protected readonly favoriteDialogMessage: Signal<string> = computed(() => {
    this._appSettingsService.language();
    return this._translateService.instant(
      this.favoriteDialogMode() === "remove" ? "FAVORITE_TALE_REMOVE_MESSAGE" : "FAVORITE_TALE_REPLACE_MESSAGE"
    );
  });
  protected readonly cancelFavoriteCta: Signal<RsDialogCta> = computed(() => {
    this._appSettingsService.language();
    return {
      label: this._translateService.instant("CANCEL"),
      variant: EVariant.SECONDARY,
      disabled: this.favoriteSaving()
    };
  });
  protected readonly confirmFavoriteCta: Signal<RsDialogCta> = computed(() => {
    this._appSettingsService.language();
    return {
      label: this._translateService.instant("CONFIRM"),
      variant: EVariant.WARNING,
      disabled: this.favoriteSaving(),
      inProgress: this.favoriteSaving()
    };
  });

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

  protected onFavoritePressed(): void {
    if (this.favoriteSaving()) return;

    if (this.isFavorite()) {
      this.favoriteDialogMode.set("remove");
      return;
    }

    if (this.favoriteTaleId() !== null) {
      this.favoriteDialogMode.set("replace");
      return;
    }

    this.saveFavorite();
  }

  protected closeFavoriteDialog(): void {
    if (this.favoriteSaving()) return;
    this.favoriteDialogMode.set(null);
  }

  protected confirmFavoriteChange(): void {
    const mode = this.favoriteDialogMode();
    if (!mode || this.favoriteSaving()) return;

    if (mode === "remove") {
      this.clearFavorite();
    } else {
      this.saveFavorite();
    }
  }

  private saveFavorite(): void {
    this.favoriteSaving.set(true);
    this._userProfileService.setFavoriteTale(this.tale().id).pipe(
      finalize(() => this.favoriteSaving.set(false))
    ).subscribe({
      next: () => this.favoriteDialogMode.set(null),
      error: (error) => this._printer.error("failed to set favorite tale", error)
    });
  }

  private clearFavorite(): void {
    this.favoriteSaving.set(true);
    this._userProfileService.clearFavoriteTale().pipe(
      finalize(() => this.favoriteSaving.set(false))
    ).subscribe({
      next: () => this.favoriteDialogMode.set(null),
      error: (error) => this._printer.error("failed to clear favorite tale", error)
    });
  }
}
