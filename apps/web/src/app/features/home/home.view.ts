import {Component, inject, Signal} from "@angular/core";
import {LocalStoreService} from "../../../services/local-store.service";
import {MeResponseDTO} from "../../../interface/dtos/user/MeResponseDTO";
import {TranslatePipe} from "@ngx-translate/core";
import {RsAvatar} from "../../shared/fragments/rsAvatar/rs.avatar";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";

@Component({
  selector: "rs-home",
  standalone: true,
  imports: [
    TranslatePipe,
    RsAvatar,
    RsViewHeader,
  ],
  templateUrl: "./home.view.html",
  styleUrl: "./home.view.scss"
})
export class HomeView {
  private readonly _LocalStoreService: LocalStoreService = inject(LocalStoreService);

  protected user: Signal<MeResponseDTO | null> = this._LocalStoreService.user;
}
