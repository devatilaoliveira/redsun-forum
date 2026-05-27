import {HttpErrorResponse} from "@angular/common/http";
import {Injectable, inject} from "@angular/core";
import {ITranslateService, TranslateService} from "@ngx-translate/core";
import {from, Observable} from "rxjs";
import {catchError, switchMap} from "rxjs/operators";
import {AuthService, IAuthService} from "./auth.service";
import {ISupabaseAuthClient, SupabaseAuthClientAdapter} from "./supabase-auth-client.adapter";
import {IPrinter, Printer} from "../infra/miscellaneous/printer.handler";
import {environment} from "../environments/environment";
import {ROUTE_PATHS} from "../interface/constants/route-path.constants";
import {MeResponseDTO} from "../interface/dtos/user/MeResponseDTO";
import {IOAuthResult} from "../interface/models/ioauth-result-message";
import {EStatus} from "../interface/enums/EStatus";
import {IAuthCallbackState} from "../interface/models/iauth-callback-state";
import {AuthCallbackResult} from "../interface/models/iauth-callback-result";
import {UtilFunctions} from "../infra/miscellaneous/util.functions";

@Injectable({providedIn: "root"})
export class AuthCallbackService {
  private readonly _authService: IAuthService = inject(AuthService);
  private readonly _supabaseAuthClient: ISupabaseAuthClient = inject(SupabaseAuthClientAdapter);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _translate: ITranslateService = inject(TranslateService);
  private readonly _parentOrigin: string = UtilFunctions.getAppOrigin(environment.baseUrl);

  handle(urlString: string): Observable<AuthCallbackResult> {
    const url: URL = new URL(urlString);
    const error: string | null = url.searchParams.get("error");
    const errorCode: string | null = url.searchParams.get("error_code");
    const code: string | null = url.searchParams.get("code");

    if (error) {
      return this._handleLoginFailure({
        authError: error,
        authErrorCode: errorCode ?? undefined
      });
    }

    if (!code) {
      this._printer.error("Missing authorization code");
      return this._handleLoginFailure({
        authError: this._translate.instant("MISSING_CODE")
      });
    }

    return from(this._supabaseAuthClient.exchangeCodeForSession(code)).pipe(
      switchMap((): Observable<AuthCallbackResult> => {
        return this._authService.completeSignIn().pipe(
          switchMap((me: MeResponseDTO): Observable<AuthCallbackResult> => {
            const sent = this._notifyOpener(undefined, me);
            if (sent) {
              return from([
                {
                  status: EStatus.SUCCESS,
                  sentToOpener: true
                } as AuthCallbackResult
              ]);
            }

            return from([
              {
                status: EStatus.SUCCESS,
                redirectUrl: `/${ROUTE_PATHS.home}`
              } as AuthCallbackResult
            ]);
          }),
          catchError(httpError => {
            this._printer.error("Backend could not complete OAuth sign-in", httpError);

            return from(this._authService.logout()).pipe(
              switchMap((): Observable<AuthCallbackResult> =>
                this._handleLoginFailure({
                  authError: this._resolveBackendLoginError(httpError)
                })
              )
            );
          })
        );
      }),
      catchError((error: unknown): Observable<AuthCallbackResult> => {
        this._printer.error("Supabase error while exchanging code for session", error);
        return this._handleLoginFailure({
          authError: this._translate.instant("UNEXPECTED_ERROR")
        });
      })
    );
  }

  private _handleLoginFailure(state: IAuthCallbackState): Observable<AuthCallbackResult> {
    const messageParts: string[] = [state.authError, state.authErrorCode].filter((value: string | undefined): value is string => Boolean(value));
    const message: string | undefined = messageParts.length ? messageParts.join(" ") : undefined;

    this._notifyOpener(message);
    return from([
      {
        status: EStatus.ERROR,
        redirectUrl: `/${ROUTE_PATHS.login}`,
        sentToOpener: true,
        redirectState: state
      } as AuthCallbackResult
    ]);
  }

  private _notifyOpener(message?: string, user?: MeResponseDTO): boolean {
    if (!window.opener) {
      return false;
    }

    const oAuthResult: IOAuthResult = {message, user};

    window.opener.postMessage(oAuthResult, this._parentOrigin);
    window.close();

    return true;
  }

  private _resolveBackendLoginError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return this._translate.instant("ERROR_VALIDATING_SESSION");
      }

      if (error.status === 403 || error.status === 404) {
        return this._translate.instant("AUTH_ACCOUNT_ERROR");
      }
    }

    return this._translate.instant("UNEXPECTED_ERROR");
  }
}
