import {inject, Injectable} from "@angular/core";
import {isAuthApiError, Session} from "@supabase/supabase-js";
import {IPrinter, Printer} from "../infra/miscellaneous/printer.handler";
import {ISupabaseAuthClient, SupabaseAuthClientAdapter} from "./supabase-auth-client.adapter";

export interface IAuthSessionService {
  getCurrentSession(): Promise<Session | null>;
}

@Injectable({providedIn: "root"})
export class AuthSessionService implements IAuthSessionService {
  private static readonly terminalSessionErrorCodes = new Set<string>([
    "refresh_token_already_used",
    "refresh_token_not_found",
    "session_expired",
    "session_not_found"
  ]);

  private readonly _supabaseAuthClient: ISupabaseAuthClient = inject(SupabaseAuthClientAdapter);
  private readonly _printer: IPrinter = inject(Printer);

  public async getCurrentSession(): Promise<Session | null> {
    try {
      return await this._supabaseAuthClient.getSession();
    } catch (error) {
      if (this._isTerminalSessionError(error)) {
        this._printer.warn("Supabase session is no longer valid.", error);
        return null;
      }

      throw error;
    }
  }

  private _isTerminalSessionError(error: unknown): boolean {
    return isAuthApiError(error)
      && typeof error.code === "string"
      && AuthSessionService.terminalSessionErrorCodes.has(error.code);
  }
}
