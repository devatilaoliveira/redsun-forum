import {ErrorHandler, Injectable, inject} from "@angular/core";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {EVariant} from "../../interface/enums/EVariant";
import {IToastService, ToastService} from "../../services/toast.service";
import {AuthenticationError} from "../errors/authentication.error";
import {IPrinter, Printer} from "./printer.handler";
import {ErrorReporterService, IErrorReporterService} from "../../services/error-reporter.service";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private static readonly chunkReloadKey = "rs:chunk-load-reload-attempted";

  private readonly _translateService: TranslateService = inject(TranslateService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _toastService: IToastService = inject(ToastService);
  private readonly _router: Router = inject(Router);
  private readonly _errorReporterService: IErrorReporterService = inject(ErrorReporterService);

  handleError(error: unknown): void {
    if (this.reloadOnceForChunkLoadError(error)) {
      return;
    }

    if (error instanceof AuthenticationError) {
      void this._router.navigate([error.redirectUrl], {replaceUrl: true});
      return;
    }

    this._printer.error("Global unhandled error occurred, please address the issue: ", error);
    void this._errorReporterService.reportError(error);
    const messageUnexpectedError: string = this._translateService.instant("UNEXPECTED_ERROR");
    this._toastService.show({
      label: this._translateService.instant("ERROR"),
      message: messageUnexpectedError,
      variant: EVariant.DANGER
    });
  }

  private reloadOnceForChunkLoadError(error: unknown): boolean {
    if (!this.isChunkLoadError(error)) {
      sessionStorage.removeItem(GlobalErrorHandler.chunkReloadKey);
      return false;
    }

    if (sessionStorage.getItem(GlobalErrorHandler.chunkReloadKey) === "true") {
      return false;
    }

    sessionStorage.setItem(GlobalErrorHandler.chunkReloadKey, "true");
    window.location.reload();
    return true;
  }

  private isChunkLoadError(error: unknown): boolean {
    const candidate = this.unwrapError(error);
    const name = this.errorField(candidate, "name");
    const message = this.errorField(candidate, "message");

    return name === "ChunkLoadError" ||
      message.includes("ChunkLoadError") ||
      message.includes("Loading chunk") ||
      message.includes("Failed to fetch dynamically imported module") ||
      message.includes("Importing a module script failed");
  }

  private unwrapError(error: unknown): unknown {
    if (error && typeof error === "object" && "rejection" in error) {
      return (error as { rejection: unknown }).rejection;
    }

    return error;
  }

  private errorField(error: unknown, field: "name" | "message"): string {
    if (error instanceof Error) {
      return error[field] ?? "";
    }

    if (error && typeof error === "object" && field in error) {
      const value = (error as Record<typeof field, unknown>)[field];
      return typeof value === "string" ? value : "";
    }

    return typeof error === "string" && field === "message" ? error : "";
  }
}
