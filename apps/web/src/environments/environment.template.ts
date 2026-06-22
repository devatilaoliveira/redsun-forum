// Template that mirrors the runtime environment shape without real secrets.
// This file is intended as a reference for runtime configuration shape.
type RuntimeEnv = Partial<{
  APP_ENV: string;
  BASE_URL: string;
  API_BASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
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
  production: runtimeEnv.APP_ENV?.trim() === "prod",
  baseUrl: requireEnvValue(runtimeEnv.BASE_URL, "BASE_URL"),
  apiBaseUrl: requireEnvValue(runtimeEnv.API_BASE_URL, "API_BASE_URL"),
  supabaseUrl: requireEnvValue(runtimeEnv.SUPABASE_URL, "SUPABASE_URL"),
  supabasePublishableKey: requireEnvValue(runtimeEnv.SUPABASE_PUBLISHABLE_KEY, "SUPABASE_PUBLISHABLE_KEY"),
};
