import {Component, inject, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {IAuthCallbackState} from "../../../interface/models/iauth-callback-state";
import {EStatus} from "../../../interface/enums/EStatus";
import {AuthCallbackResult} from "../../../interface/models/iauth-callback-result";
import {AuthCallbackService} from "../../../services/auth-callback.service";

@Component({
  selector: "rs-auth-callback-view",
  templateUrl: "./auth-callback.view.html",
  styleUrl: "./auth-callback.view.scss"
})
export class AuthCallbackView implements OnInit {
  private readonly _router: Router = inject(Router);
  private readonly _authCallbackService: AuthCallbackService = inject(AuthCallbackService);

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
