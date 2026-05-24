import {ErrorHandler, Injectable, inject} from "@angular/core";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {EVariant} from "../../interface/enums/EVariant";
import {IToastService, ToastService} from "../../services/toast.service";
import {AuthenticationError} from "../errors/authentication.error";
import {IPrinter, Printer} from "./printer.handler";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly _translateService: TranslateService = inject(TranslateService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _toastService: IToastService = inject(ToastService);
  private readonly _router: Router = inject(Router);

  handleError(error: unknown): void {
    if (error instanceof AuthenticationError) {
      void this._router.navigate([error.redirectUrl], {replaceUrl: true});
      return;
    }

    this._printer.error("Global unhandled error occurred, please address the issue: ", error);
    const messageUnexpectedError: string = this._translateService.instant("UNEXPECTED_ERROR");
    this._toastService.show({
      label: this._translateService.instant("ERROR"),
      message: messageUnexpectedError,
      variant: EVariant.DANGER
    });
  }
}
