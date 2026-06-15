import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from "@angular/common/http";
import {inject} from "@angular/core";
import {from, Observable, throwError} from "rxjs";
import {switchMap, catchError} from "rxjs/operators";
import {Session} from "@supabase/supabase-js";
import {AuthService} from "../../services/auth.service";
import {AuthenticationError} from "../errors/authentication.error";
import {ROUTE_PATHS} from "../../interface/constants/route-path.constants";

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const _authService: AuthService = inject(AuthService);

  return from(_authService.getCurrentSession()).pipe(
    switchMap((session: Session | null): Observable<HttpEvent<unknown>> => {
      const requestToSend: HttpRequest<unknown> = session?.access_token
        ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${session.access_token}`
          }
        })
        : req;

      return next(requestToSend).pipe(
        catchError((error: HttpErrorResponse): Observable<never> => {
          if (error.status === 401) {
            if (req.url.includes("/authentication/")) {
              return throwError(() => error);
            }

            return from(_authService.logout()).pipe(
              switchMap(() => {
                return throwError(() => new AuthenticationError(`/${ROUTE_PATHS.login}`, error));
              })
            );
          }

          return throwError(() => error);
        })
      );
    })
  );
};
