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
    this.logFullError(error);

    this._toastService.show({
      label: this._translateService.instant("ERROR"),
      message: this._translateService.instant("UNEXPECTED_ERROR"),
      variant: EVariant.DANGER
    });
  }

  private logFullError(error: unknown): void {
    const normalizedError = this.normalizeError(error);

    console.group("Global unhandled error occurred");
    console.error("Raw error:", error);
    console.error("Name:", normalizedError.name);
    console.error("Message:", normalizedError.message);
    console.error("Stack:", normalizedError.stack);
    console.error("Cause:", normalizedError.cause);
    console.error("Full normalized error:", normalizedError);
    console.groupEnd();

    this._printer.error("Global unhandled error occurred", normalizedError);
  }

  private normalizeError(error: unknown): {
    name?: string;
    message: string;
    stack?: string;
    cause?: unknown;
    rawType: string;
    raw?: unknown;
  } {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: "cause" in error ? error.cause : undefined,
        rawType: "Error",
        raw: error
      };
    }

    if (typeof error === "string") {
      return {
        message: error,
        rawType: "string",
        raw: error
      };
    }

    if (error && typeof error === "object") {
      return {
        message: this.safeStringify(error),
        rawType: error.constructor?.name ?? "object",
        raw: error
      };
    }

    return {
      message: String(error),
      rawType: typeof error,
      raw: error
    };
  }

  private safeStringify(value: unknown): string {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "[Unserializable error object]";
    }
  }
}
