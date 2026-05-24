import {Location} from "@angular/common";
import {Component, inject} from "@angular/core";
import {Router} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {RedsunTitle} from "../../fragments/redsunTitle/redsun.title";
import {RsButtonText} from "../../fragments/rsButtonText/rs.button-text";
import {RsRoundIconButton} from "../../fragments/rsRoundIconButton/rs.round-icon-button";
import {PublicLegalFooterComponent} from "../public-legal-footer/public-legal-footer.component";

@Component({
  selector: "rs-legal-page-shell",
  standalone: true,
  imports: [TranslatePipe, RedsunTitle, RsButtonText, RsRoundIconButton, PublicLegalFooterComponent],
  templateUrl: "./legal-page-shell.component.html",
  styleUrl: "./legal-page-shell.component.scss"
})
export class LegalPageShellComponent {
  private readonly _location: Location = inject(Location);
  private readonly _router: Router = inject(Router);

  protected readonly homeRoute: string = "/";

  protected onBack(): void {
    if (window.history.length > 1) {
      this._location.back();
      return;
    }

    void this._router.navigateByUrl(this.homeRoute);
  }
}
