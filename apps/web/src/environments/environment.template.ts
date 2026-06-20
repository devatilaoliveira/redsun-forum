// Template that mirrors `environment.prod.ts` behavior without real secrets.
// This file is intended as a reference for runtime configuration shape.
type RuntimeEnv = Partial<{
  BASE_URL: string;
  API_BASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  baseUrl: string;
  apiBaseUrl: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
}>;

const runtimeEnv: RuntimeEnv = (globalThis as {__env?: RuntimeEnv}).__env ?? {};

const requireEnvValue = (value: string | undefined, name: string): string => {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.startsWith("__")) {
    throw new Error(`Missing required runtime environment value: ${name}`);
  }

  return trimmed;
};

export const environment = {
  production: true,
  baseUrl: requireEnvValue(runtimeEnv.BASE_URL ?? runtimeEnv.baseUrl, "BASE_URL"),
  apiBaseUrl: requireEnvValue(runtimeEnv.API_BASE_URL ?? runtimeEnv.apiBaseUrl, "API_BASE_URL"),
  supabaseUrl: requireEnvValue(
    runtimeEnv.SUPABASE_URL ?? runtimeEnv.supabaseUrl,
    "SUPABASE_URL"
  ),
  supabasePublishableKey: requireEnvValue(
    runtimeEnv.SUPABASE_PUBLISHABLE_KEY ?? runtimeEnv.supabasePublishableKey,
    "SUPABASE_PUBLISHABLE_KEY"
  ),
};
