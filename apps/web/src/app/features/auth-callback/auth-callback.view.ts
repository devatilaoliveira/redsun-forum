import {Component, inject, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {IAuthCallbackState} from "../../../interface/models/iauth-callback-state";
import {EStatus} from "../../../interface/enums/EStatus";
import {EVariant} from "../../../interface/enums/EVariant";
import {AuthCallbackResult} from "../../../interface/models/iauth-callback-result";
import {AuthCallbackService} from "../../../services/auth-callback.service";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";

@Component({
  selector: "rs-auth-callback-view",
  standalone: true,
  imports: [TranslatePipe, RsSpinner],
  templateUrl: "./auth-callback.view.html",
  styleUrl: "./auth-callback.view.scss"
})
export class AuthCallbackView implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _authCallbackService: AuthCallbackService = inject(AuthCallbackService);
  protected readonly EVariant = EVariant;

  ngOnInit(): void {
    this._authCallbackService.handle(window.location.href).subscribe(
      (result: AuthCallbackResult) => {
        if (result.sentToOpener) {
          return;
        }

        if (result.status === EStatus.ERROR) {
          void this._router.navigate([result.redirectUrl], {
            replaceUrl: true,
            state: result.redirectState as IAuthCallbackState
          });
        }
      }
    );
  }
}
