import {Component} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {ESize} from "../../../../interface/enums/ESize";
import {RsButtonText} from "../../fragments/rsButtonText/rs.button-text";

@Component({
  selector: "rs-public-legal-footer",
  standalone: true,
  imports: [TranslatePipe, RsButtonText],
  templateUrl: "./public-legal-footer.component.html",
  styleUrl: "./public-legal-footer.component.scss"
})
export class PublicLegalFooterComponent {
  protected readonly ESize = ESize;
  protected readonly privacyRoute: string = `/${ROUTE_PATHS.privacy}`;
  protected readonly termsRoute: string = `/${ROUTE_PATHS.terms}`;
  protected readonly cookiesRoute: string = `/${ROUTE_PATHS.cookies}`;
  protected readonly dataProtectionRoute: string = `/${ROUTE_PATHS.dataProtection}`;
  protected readonly reportContentRoute: string = `/${ROUTE_PATHS.reportContent}`;
}
