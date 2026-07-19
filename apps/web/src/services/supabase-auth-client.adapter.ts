import {inject, Injectable} from "@angular/core";
import {SupabaseProvider} from "./supabase.provider";
import {ELoginProvider} from "../interface/enums/ELoginProvider";
import {IOAuthOptions} from "../interface/models/ioauth-options";
import {IPrinter, Printer} from "../infra/miscellaneous/printer.handler";
import {AuthChangeEvent, Session, Subscription} from "@supabase/supabase-js";

export interface SupabaseEmailCredentials {
  email: string;
  password: string;
}

export interface SupabaseSignUpCredentials extends SupabaseEmailCredentials {
  emailRedirectTo: string;
}

export interface SupabasePasswordResetRequest {
  email: string;
  redirectTo: string;
}

export interface SupabasePasswordUpdateRequest {
  password: string;
  currentPassword?: string;
  nonce?: string;
}

export interface ISupabaseAuthClient {
  signInWithOAuth(input: { provider: ELoginProvider, options: IOAuthOptions }): Promise<{ url: string }>;
  signInWithPassword(input: SupabaseEmailCredentials): Promise<void>;
  signUp(input: SupabaseSignUpCredentials): Promise<void>;
  resetPasswordForEmail(input: SupabasePasswordResetRequest): Promise<void>;
  reauthenticate(): Promise<void>;
  updatePassword(input: SupabasePasswordUpdateRequest): Promise<void>;
  exchangeCodeForSession(code: string): Promise<Session>;
  getSession(): Promise<Session | null>;
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): Subscription;
  signOut(scope: "local" | "global"): Promise<void>;
}

@Injectable({providedIn: "root"})
export class SupabaseAuthClientAdapter implements ISupabaseAuthClient {
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _supabaseAuthClient = inject(SupabaseProvider).getClient().auth;

  public async signInWithOAuth(input: { provider: ELoginProvider, options: IOAuthOptions }): Promise<{ url: string }> {
    const {data, error} = await this._supabaseAuthClient.signInWithOAuth({provider: input.provider, options: input.options});

    if (error || !data?.url) {
      const resolvedError: Error = error ?? new Error("Missing OAuth URL");
      this._printer.error(`login with ${input.provider} error`, resolvedError);
      throw resolvedError;
    }

    return {url: data.url};
  }

  public async signInWithPassword(input: SupabaseEmailCredentials): Promise<void> {
    const {error} = await this._supabaseAuthClient.signInWithPassword({
      email: input.email,
      password: input.password
    });

    if (error) {
      throw error;
    }
  }

  public async signUp(input: SupabaseSignUpCredentials): Promise<void> {
    const {error} = await this._supabaseAuthClient.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: input.emailRedirectTo
      }
    });

    if (error) {
      throw error;
    }
  }

  public async resetPasswordForEmail(input: SupabasePasswordResetRequest): Promise<void> {
    const {error} = await this._supabaseAuthClient.resetPasswordForEmail(input.email, {
      redirectTo: input.redirectTo
    });

    if (error) {
      throw error;
    }
  }

  public async reauthenticate(): Promise<void> {
    const {error} = await this._supabaseAuthClient.reauthenticate();

    if (error) {
      throw error;
    }
  }

  public async updatePassword(input: SupabasePasswordUpdateRequest): Promise<void> {
    const attributes: {
      password: string;
      nonce?: string;
      current_password?: string;
    } = {
      password: input.password
    };

    if (input.nonce) {
      attributes.nonce = input.nonce;
    }

    if (input.currentPassword) {
      attributes.current_password = input.currentPassword;
    }

    const {error} = await this._supabaseAuthClient.updateUser(attributes);

    if (error) {
      throw error;
    }
  }

  public async exchangeCodeForSession(code: string): Promise<Session> {
    const {data, error} = await this._supabaseAuthClient.exchangeCodeForSession(code);

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error("Missing Supabase session");
    }

    return data.session;
  }

  public async getSession(): Promise<Session | null> {
    const {data, error} = await this._supabaseAuthClient.getSession();

    if (error) {
      throw error;
    }

    return data.session;
  }

  public onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): Subscription {
    return this._supabaseAuthClient.onAuthStateChange(callback).data.subscription;
  }

  public async signOut(scope: "local" | "global"): Promise<void> {
    const {error} = await this._supabaseAuthClient.signOut({scope});
    if (error) {
      throw error;
    }
  }
}
