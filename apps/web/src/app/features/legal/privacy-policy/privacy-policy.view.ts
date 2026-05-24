import {Component} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";
import {RsDivider} from "../../../shared/fragments/rsDivider/rs.divider";
import {RsViewHeader} from "../../../shared/fragments/rsViewHeader/rs.view-header";
import {LegalPageShellComponent} from "../../../shared/ui/legal-page-shell/legal-page-shell.component";

@Component({
  selector: "rs-privacy-policy",
  standalone: true,
  imports: [TranslatePipe, RsDivider, RsViewHeader, LegalPageShellComponent],
  templateUrl: "./privacy-policy.view.html",
  styleUrl: "./privacy-policy.view.scss"
})
export class PrivacyPolicyView {}
