import {Component, inject} from "@angular/core";
import {AuthService} from "../../../../services/auth.service";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {IPrinter, Printer} from "../../../../infra/miscellaneous/printer.handler";
import {NgOptimizedImage} from "@angular/common";
import {ELoginProvider} from "../../../../interface/enums/ELoginProvider";
import {EVariant} from "../../../../interface/enums/EVariant";
import {IToastService, ToastService} from "../../../../services/toast.service";

@Component({
  selector: "google-button",
  imports: [
    TranslatePipe,
    NgOptimizedImage
  ],
  templateUrl: "./google.button.html",
  styleUrl: "./google.button.scss"
})
export class GoogleButton {
  private readonly _authService: AuthService = inject(AuthService);
  private readonly _translateService: TranslateService = inject(TranslateService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _toastService: IToastService = inject(ToastService);

  async loginGoogle(): Promise<void> {
    try {
      await this._authService.loginWithProvider(ELoginProvider.GOOGLE);
    } catch (error) {
      this._printer.error("Failed to log in with Google", error);
      const msg = this._translateService.instant("GOOGLE_ERROR");
      this.openToast(msg);
    }
  }

  private openToast(message: string, variant: EVariant = EVariant.DANGER): void {
    this._toastService.show({
      label: variant === EVariant.SUCCESS
        ? this._translateService.instant("SUCCESS")
        : this._translateService.instant("ERROR"),
      message,
      variant
    });
  }
}
