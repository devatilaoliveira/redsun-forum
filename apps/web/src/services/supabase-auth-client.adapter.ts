import {inject, Injectable} from "@angular/core";
import {SupabaseProvider} from "./supabase.provider";
import {ELoginProvider} from "../interface/enums/ELoginProvider";
import {IOAuthOptions} from "../interface/models/ioauth-options";
import {IPrinter, Printer} from "../infra/miscellaneous/printer.handler";
import {SupabaseAuthClient} from "@supabase/supabase-js/dist/main/lib/SupabaseAuthClient";

export interface ISupabaseAuthClient {
  signInWithOAuth(input: { provider: ELoginProvider, options: IOAuthOptions }): Promise<{ url: string }>;
  signOut(): Promise<void>;
}

@Injectable({providedIn: "root"})
export class SupabaseAuthClientAdapter implements ISupabaseAuthClient {
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _supabaseAuthClient: SupabaseAuthClient = inject(SupabaseProvider).getClient().auth;

  public async signInWithOAuth(input: { provider: ELoginProvider, options: IOAuthOptions }): Promise<{ url: string }> {
    const {data, error} = await this._supabaseAuthClient.signInWithOAuth({provider: input.provider, options: input.options});

    if (error || !data?.url) {
      const resolvedError: Error = error ?? new Error("Missing OAuth URL");
      this._printer.error(`login with ${input.provider} error`, resolvedError);
      throw resolvedError;
    }

    return {url: data.url};
  }

  public async signOut(): Promise<void> {
    try {
      const globalResult = await this._supabaseAuthClient.signOut();
      if (globalResult?.error) {
        throw globalResult.error;
      }
    } catch (error) {
      const message: string = error instanceof Error ? error.message : String(error);
      const isInvalidRefreshToken: boolean = message.includes("Invalid Refresh Token") || message.includes("Refresh Token Not Found");

      if (!isInvalidRefreshToken) {
        throw error;
      }

      const localResult = await this._supabaseAuthClient.signOut({scope: "local"});
      if (localResult?.error) {
        throw localResult.error;
      }
    }
  }
}
