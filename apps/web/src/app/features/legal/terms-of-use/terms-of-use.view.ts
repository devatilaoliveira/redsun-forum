import {Component} from "@angular/core";
import {RouterLink} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {RsDivider} from "../../../shared/fragments/rsDivider/rs.divider";
import {RsViewHeader} from "../../../shared/fragments/rsViewHeader/rs.view-header";
import {LegalPageShellComponent} from "../../../shared/ui/legal-page-shell/legal-page-shell.component";

@Component({
  selector: "rs-terms-of-use",
  standalone: true,
  imports: [RouterLink, TranslatePipe, RsDivider, RsViewHeader, LegalPageShellComponent],
  templateUrl: "./terms-of-use.view.html",
  styleUrl: "./terms-of-use.view.scss"
})
export class TermsOfUseView {
  protected readonly privacyRoute: string = `/${ROUTE_PATHS.privacy}`;
  protected readonly reportContentRoute: string = `/${ROUTE_PATHS.reportContent}`;
}
