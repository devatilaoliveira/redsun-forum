import {Component} from "@angular/core";
import {RouterLink} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {RsDivider} from "../../../shared/fragments/rsDivider/rs.divider";
import {RsViewHeader} from "../../../shared/fragments/rsViewHeader/rs.view-header";
import {LegalPageShellComponent} from "../../../shared/ui/legal-page-shell/legal-page-shell.component";

@Component({
  selector: "rs-report-content",
  standalone: true,
  imports: [TranslatePipe, RouterLink, RsDivider, RsViewHeader, LegalPageShellComponent],
  templateUrl: "./report-content.view.html",
  styleUrl: "./report-content.view.scss"
})
export class ReportContentView {
  protected readonly reportEmail: string = "dev.atila.oliveira@gmail.com";
  protected readonly mailtoHref: string = `mailto:${this.reportEmail}`;
  protected readonly supportRoute: string = `/${ROUTE_PATHS.support}`;
}
