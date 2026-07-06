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
import {IOAuthOptions} from "../interface/models/ioauth-options";
import {ISupabaseAuthClient, SupabaseAuthClientAdapter} from "./supabase-auth-client.adapter";
import {IUserProfileService, UserProfileService} from "./user-profile.service";
import {MeResponseDTO} from "../interface/dtos/user/MeResponseDTO";
import {UtilFunctions} from "../infra/miscellaneous/util.functions";
import {TaleContextStateService} from "../stateServices/tale-context-state.service";

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
  private readonly _taleContextState: TaleContextStateService = inject(TaleContextStateService);

  public async loginWithProvider(provider: ELoginProvider): Promise<void> {
    const options: IOAuthOptions = this._getOAuthOptions(provider);

    try {
      await this._supabaseAuthClient.signInWithOAuth({provider, options});
    } catch (error) {
      this._printer.error(`OAuth error (${provider})`, error as Error);
      throw error;
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
    this._authSessionService.clearCachedSession();
    this._localStoreService.removeUser();
    this._taleContextState.clear();

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
    const redirectTo: string = UtilFunctions.buildAppUrl(UTIL_CONSTANTS.OAUTH_CALLBACK_PATH, environment.baseUrl);

    switch (provider) {
    case ELoginProvider.GOOGLE:
      return {
        redirectTo,
        scopes: "openid profile email",
        queryParams: {
          prompt: "select_account"
        }
      };
    default:
      return {
        redirectTo
      };
    }
  }
}
