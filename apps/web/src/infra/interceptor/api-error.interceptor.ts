import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from "@angular/common/http";
import {inject} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import {environment} from "../../environments/environment";
import {EVariant} from "../../interface/enums/EVariant";
import {ErrorReporterService, IErrorReporterService} from "../../services/error-reporter.service";
import {IToastService, ToastService} from "../../services/toast.service";

export const apiErrorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const toastService: IToastService = inject(ToastService);
  const translateService: TranslateService = inject(TranslateService);
  const errorReporterService: IErrorReporterService = inject(ErrorReporterService);

  return next(req).pipe(
    catchError((error: unknown): Observable<never> => {

      if (error instanceof HttpErrorResponse && shouldHandleApiError(req)) {
        toastService.show({
          label: translateService.instant("ERROR"),
          message: translateService.instant("UNEXPECTED_ERROR"),
          variant: EVariant.DANGER
        });
        void errorReporterService.reportError(error);
      }

      return throwError(() => error);
    })
  );
};

function shouldHandleApiError(req: HttpRequest<unknown>): boolean {
  if (!isApiRequest(req.url)) {
    return false;
  }

  return !req.url.includes("/client-errors") && !req.url.includes("/authentication/");
}

function isApiRequest(url: string): boolean {
  const apiBaseUrl: string = environment.apiBaseUrl.replace(/\/$/, "");
  return url === apiBaseUrl || url.startsWith(`${apiBaseUrl}/`);
}
