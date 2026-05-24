import {Component} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";
import {RsDivider} from "../../../shared/fragments/rsDivider/rs.divider";
import {RsViewHeader} from "../../../shared/fragments/rsViewHeader/rs.view-header";
import {LegalPageShellComponent} from "../../../shared/ui/legal-page-shell/legal-page-shell.component";

@Component({
  selector: "rs-cookies",
  standalone: true,
  imports: [TranslatePipe, RsDivider, RsViewHeader, LegalPageShellComponent],
  templateUrl: "./cookies.view.html",
  styleUrl: "./cookies.view.scss"
})
export class CookiesView {}
