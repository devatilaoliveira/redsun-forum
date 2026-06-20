import {Injectable} from "@angular/core";
import {createClient, SupabaseClient} from "@supabase/supabase-js";
import {environment} from "../environments/environment";

@Injectable({providedIn: "root"})
export class SupabaseProvider {
  private readonly _supabaseClient: SupabaseClient;

  constructor() {
    /* @vite-ignore */
    this._supabaseClient = createClient(
      environment.supabaseUrl,
      environment.supabasePublishableKey, {
        auth: {
          flowType: "pkce",
          detectSessionInUrl: false
        }
      }
    );
  }

  getClient(): SupabaseClient {
    return this._supabaseClient;
  }
}
