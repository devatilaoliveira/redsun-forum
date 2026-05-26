import {inject, Injectable} from "@angular/core";
import {environment} from "../environments/environment";
import {Session} from "@supabase/supabase-js";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {ILocalStoreService, LocalStoreService} from "./local-store.service";
import {AuthSessionService, IAuthSessionService} from "./session.service";
import {IPrinter, Printer} from "../infra/miscellaneous/printer.handler";
import {UTIL_CONSTANTS} from "../interface/constants/util.constants";
import {ELoginProvider} from "../interface/enums/ELoginProvider";
import {IOAuthPopupHandler, OAuthPopupHandler} from "../infra/miscellaneous/oauth-popup.handler";
import {IOAuthOptions} from "../interface/models/ioauth-options";
import {ISupabaseAuthClient, SupabaseAuthClientAdapter} from "./supabase-auth-client.adapter";
import {IUserProfileService, UserProfileService} from "./user-profile.service";
import {MeResponseDTO} from "../interface/dtos/user/MeResponseDTO";

export interface IAuthService {
  loginWithProvider(provider: ELoginProvider): Promise<void>;

  recordSessionEstablished(): Observable<void>;

  completeSignIn(): Observable<MeResponseDTO>;

  logout(): Promise<void>;

  getCurrentSession(): Promise<Session | null>;
}

@Injectable({providedIn: "root"})
export class AuthService implements IAuthService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private readonly _authSessionService: IAuthSessionService = inject(AuthSessionService);
  private readonly _supabaseAuthClient: ISupabaseAuthClient = inject(SupabaseAuthClientAdapter);
  private readonly _localStoreService: ILocalStoreService = inject(LocalStoreService);
  private readonly _userProfileService: IUserProfileService = inject(UserProfileService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _oauthPopupHandler: IOAuthPopupHandler = inject(OAuthPopupHandler);

  public async loginWithProvider(provider: ELoginProvider): Promise<void> {
    const options: IOAuthOptions = this._getOAuthOptions(provider);

    let url: string;
    try {
      const result = await this._supabaseAuthClient.signInWithOAuth({provider, options});
      url = result.url;
    } catch (error) {
      this._printer.error(`OAuth error (${provider})`, error as Error);
    }

    try {
      this._oauthPopupHandler.openPopup(url!);
    } catch (popupError) {
      this._printer.error(`login with ${provider} error`, popupError as Error);
      throw popupError;
    }
  }

  public recordSessionEstablished(): Observable<void> {
    return this._httpClient.post<void>(
      `${environment.apiBaseUrl}/authentication/session-established`,
      null
    );
  }

  public completeSignIn(): Observable<MeResponseDTO> {
    return this._userProfileService.upsertCurrentUser().pipe(
      switchMap((me: MeResponseDTO) => this.recordSessionEstablished().pipe(
        map((): MeResponseDTO => {
          this._localStoreService.storeUser(me);
          return me;
        })
      ))
    );
  }

  public async logout(): Promise<void> {
    this._oauthPopupHandler.reset();
    this._authSessionService.clearCachedSession();
    this._localStoreService.removeUser();

    try {
      await this._supabaseAuthClient.signOut();
    } catch (error) {
      this._printer.warn("Supabase signOut failed during logout; local session was cleared.", error);
    }
  }

  public async getCurrentSession(): Promise<Session | null> {
    return this._authSessionService.getCurrentSession();
  }

  private _getOAuthOptions(provider: ELoginProvider): IOAuthOptions {
    switch (provider) {
    case ELoginProvider.GOOGLE:
      return {
        redirectTo: `${environment.baseUrl}/${UTIL_CONSTANTS.OAUTH_CALLBACK_PATH}`,
        skipBrowserRedirect: true,
        scopes: "openid profile email"
      };
    default:
      return {
        redirectTo: `${environment.baseUrl}/${UTIL_CONSTANTS.OAUTH_CALLBACK_PATH}`,
        skipBrowserRedirect: true
      };
    }
  }
}
