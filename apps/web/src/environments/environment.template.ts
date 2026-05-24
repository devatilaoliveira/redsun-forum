// Template that mirrors `environment.prod.ts` behavior without real secrets.
// This file is intended as a reference for runtime configuration shape.
type RuntimeEnv = Partial<{
  BASE_URL: string;
  API_BASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  baseUrl: string;
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}>;

const runtimeEnv: RuntimeEnv = (globalThis as {__env?: RuntimeEnv}).__env ?? {};

const resolveEnvValue = (value: string | undefined, fallback: string): string => {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.startsWith("__")) {
    return fallback;
  }

  return trimmed;
};

const baseUrlFallback = globalThis.location?.origin ?? "http://localhost:4200";

export const environment = {
  production: true,
  baseUrl: resolveEnvValue(runtimeEnv.BASE_URL ?? runtimeEnv.baseUrl, baseUrlFallback),
  apiBaseUrl: resolveEnvValue(runtimeEnv.API_BASE_URL ?? runtimeEnv.apiBaseUrl, "http://localhost:8080"),
  supabaseUrl: resolveEnvValue(
    runtimeEnv.SUPABASE_URL ?? runtimeEnv.supabaseUrl,
    "https://your-project-id.supabase.co"
  ),
  supabaseAnonKey: resolveEnvValue(
    runtimeEnv.SUPABASE_ANON_KEY ?? runtimeEnv.supabaseAnonKey,
    "YOUR_SUPABASE_ANON_KEY"
  ),
};
