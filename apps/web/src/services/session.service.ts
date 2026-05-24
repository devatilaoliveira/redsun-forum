import {DestroyRef, inject, Injectable} from "@angular/core";
import {SupabaseProvider} from "./supabase.provider";
import {AuthChangeEvent, Session} from "@supabase/supabase-js";
import {IPrinter, Printer} from "../infra/miscellaneous/printer.handler";

export interface IAuthSessionService {
  getCurrentSession(): Promise<Session | null>;
  clearCachedSession(): void;
}

@Injectable({providedIn: "root"})
export class AuthSessionService implements IAuthSessionService {
  private readonly _supabase: SupabaseProvider = inject(SupabaseProvider);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _printer: IPrinter = inject(Printer);

  private _cachedSession: Session | null = null;

  constructor() {
    this._initAuthListener();
  }

  private _initAuthListener(): void {
    const {data} = this._supabase.getClient().auth.onAuthStateChange((_: AuthChangeEvent, session: Session | null): void => {
      this._cachedSession = session;
    });

    this._destroyRef.onDestroy((): void => {
      data.subscription.unsubscribe();
    });
  }

  public async getCurrentSession(): Promise<Session | null> {
    if (!this._cachedSession) {
      const {data, error} = await this._supabase.getClient().auth.getSession();
      if (error) {
        this._printer.error("Erro getSession", error);
        const message: string = error instanceof Error ? error.message : String(error);
        const isInvalidRefreshToken: boolean = message.includes("Invalid Refresh Token") || message.includes("Refresh Token Not Found");

        if (isInvalidRefreshToken) {
          try {
            await this._supabase.getClient().auth.signOut({scope: "local"});
          } catch (cleanupError) {
            this._printer.warn("Erro ao limpar sessão local do Supabase", cleanupError);
          }
        }
        return null;
      }
      this._cachedSession = data.session;
    }
    return this._cachedSession;
  }

  public clearCachedSession(): void {
    this._cachedSession = null;
  }
}
