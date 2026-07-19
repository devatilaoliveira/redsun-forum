import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from "@angular/common/http";
import {inject} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import {EVariant} from "../../interface/enums/EVariant";
import {ErrorReporterService, IErrorReporterService} from "../../services/error-reporter.service";
import {IToastService, ToastService} from "../../services/toast.service";
import {isApiRequest} from "./api-request.helper";

export const apiErrorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const toastService: IToastService = inject(ToastService);
  const translateService: TranslateService = inject(TranslateService);
  const errorReporterService: IErrorReporterService = inject(ErrorReporterService);

  return next(req).pipe(
    catchError((error: unknown): Observable<never> => {

      if (error instanceof HttpErrorResponse && shouldHandleApiError(req, error)) {
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

function shouldHandleApiError(req: HttpRequest<unknown>, error: HttpErrorResponse): boolean {
  if (!isApiRequest(req.url)) {
    return false;
  }

  if (error.status === 401) {
    return false;
  }

  return !req.url.includes("/client-errors") && !req.url.includes("/authentication/");
}
