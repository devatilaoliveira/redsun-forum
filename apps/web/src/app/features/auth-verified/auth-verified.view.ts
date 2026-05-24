import {Component, inject} from "@angular/core";
import {Router} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {EVariant} from "../../../interface/enums/EVariant";
import {RedsunTitle} from "../../shared/fragments/redsunTitle/redsun.title";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {PublicLegalFooterComponent} from "../../shared/ui/public-legal-footer/public-legal-footer.component";

@Component({
  selector: "rs-auth-verified",
  standalone: true,
  imports: [TranslatePipe, RedsunTitle, RsButton, PublicLegalFooterComponent],
  templateUrl: "./auth-verified.view.html",
  styleUrl: "./auth-verified.view.scss"
})
export class AuthVerifiedView {
  private readonly _router: Router = inject(Router);

  protected readonly EVariant = EVariant;

  protected onGoToLogin(): void {
    void this._router.navigate(["/", ROUTE_PATHS.login]);
  }
}
