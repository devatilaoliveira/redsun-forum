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

const resolveEnvValue = (value: string | undefined, fallback: string): string => {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.startsWith("__")) {
    return fallback;
  }

  return trimmed;
};

const requireEnvValue = (value: string | undefined, name: string): string => {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.startsWith("__")) {
    throw new Error(`Missing required runtime environment value: ${name}`);
  }

  return trimmed;
};

const baseUrlFallback = globalThis.location?.origin ?? "http://localhost:4200";

export const environment = {
  production: false,
  baseUrl: resolveEnvValue(runtimeEnv.BASE_URL ?? runtimeEnv.baseUrl, baseUrlFallback),
  apiBaseUrl: resolveEnvValue(runtimeEnv.API_BASE_URL ?? runtimeEnv.apiBaseUrl, "http://localhost:8080"),
  supabaseUrl: requireEnvValue(
    runtimeEnv.SUPABASE_URL ?? runtimeEnv.supabaseUrl,
    "SUPABASE_URL"
  ),
  supabasePublishableKey: requireEnvValue(
    runtimeEnv.SUPABASE_PUBLISHABLE_KEY ?? runtimeEnv.supabasePublishableKey,
    "SUPABASE_PUBLISHABLE_KEY"
  ),
};
