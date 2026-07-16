import {DestroyRef, inject, Injectable} from "@angular/core";
import {environment} from "../environments/environment";
import {AuthChangeEvent, Session, Subscription} from "@supabase/supabase-js";
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
import {AppSettingsService, IAppSettingsService} from "./app-settings.service";

export interface IAuthService {
  loginWithProvider(provider: ELoginProvider): Promise<void>;

  recordSessionEstablished(): Observable<void>;

  completeSignIn(): Observable<MeResponseDTO>;

  logout(): Promise<void>;

  clearInvalidSession(): Promise<void>;

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
  private readonly _appSettingsService: IAppSettingsService = inject(AppSettingsService);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);

  private _logoutPromise: Promise<void> | null = null;

  constructor() {
    const subscription: Subscription = this._supabaseAuthClient.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null): void => {
        if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session)) {
          this._clearLocalAuthState();
        }
      }
    );

    this._destroyRef.onDestroy((): void => subscription.unsubscribe());
  }

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
          this._appSettingsService.applyUserSettings(me.userSettings);
          return me;
        })
      ))
    );
  }

  public async logout(): Promise<void> {
    return this._signOutCurrentSession();
  }

  public async clearInvalidSession(): Promise<void> {
    return this._signOutCurrentSession();
  }

  private async _signOutCurrentSession(): Promise<void> {
    if (this._logoutPromise) {
      return this._logoutPromise;
    }

    const logoutPromise: Promise<void> = this._performSignOut();
    this._logoutPromise = logoutPromise;

    try {
      await logoutPromise;
    } finally {
      if (this._logoutPromise === logoutPromise) {
        this._logoutPromise = null;
      }
    }
  }

  public async getCurrentSession(): Promise<Session | null> {
    return this._authSessionService.getCurrentSession();
  }

  private async _performSignOut(): Promise<void> {
    this._clearLocalAuthState();

    try {
      await this._supabaseAuthClient.signOut("local");
    } catch (error) {
      this._printer.warn("Supabase signOut failed during logout; RedSun local state was cleared.", error);
    }
  }

  private _clearLocalAuthState(): void {
    this._localStoreService.removeUser();
    this._taleContextState.clear();
    this._appSettingsService.resetToDetectedDefaults();
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
