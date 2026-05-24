const DEFAULT_API_BASE_URL = "http://localhost:8080";

export function getE2eApiBaseUrl(): string {
  return (process.env["API_BASE_URL"] ?? DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export function getRequiredE2eCleanupToken(): string {
  const cleanupToken = process.env["APP_TEST_CLEANUP_TOKEN"]?.trim();

  if (!cleanupToken) {
    throw new Error("APP_TEST_CLEANUP_TOKEN is required to run authenticated E2E cleanup operations.");
  }

  return cleanupToken;
}
