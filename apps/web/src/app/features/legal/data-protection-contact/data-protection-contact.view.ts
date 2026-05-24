import {Component} from "@angular/core";
import {RouterLink} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {RsDivider} from "../../../shared/fragments/rsDivider/rs.divider";
import {RsViewHeader} from "../../../shared/fragments/rsViewHeader/rs.view-header";
import {LegalPageShellComponent} from "../../../shared/ui/legal-page-shell/legal-page-shell.component";

@Component({
  selector: "rs-data-protection-contact",
  standalone: true,
  imports: [RouterLink, TranslatePipe, RsDivider, RsViewHeader, LegalPageShellComponent],
  templateUrl: "./data-protection-contact.view.html",
  styleUrl: "./data-protection-contact.view.scss"
})
export class DataProtectionContactView {
  protected readonly contactEmail: string = "dev.atila.oliveira@gmail.com";
  protected readonly privacyRoute: string = `/${ROUTE_PATHS.privacy}`;
  protected readonly mailtoHref: string = `mailto:${this.contactEmail}`;
}
