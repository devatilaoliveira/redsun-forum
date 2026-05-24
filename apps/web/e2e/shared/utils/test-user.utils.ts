import { TestInfo } from "@playwright/test";

export function buildUniqueTestUserEmail(testInfo: TestInfo): string {
  const randomSuffix = Math.random().toString(36).slice(2, 10);

  return `playwright-${testInfo.workerIndex}-${Date.now()}-${randomSuffix}@example.com`;
}
