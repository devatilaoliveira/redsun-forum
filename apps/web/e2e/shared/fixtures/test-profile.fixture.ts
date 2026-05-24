import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test as base } from '@playwright/test';
import { TestProfile } from '../models/TestProfile';

const TEST_PROFILES_PATH = resolve(__dirname, '../config/test-profiles.json');

function loadTestProfiles(): TestProfile[] {
  const profiles = JSON.parse(readFileSync(TEST_PROFILES_PATH, 'utf-8')) as TestProfile[];

  if (!Array.isArray(profiles) || profiles.length === 0) {
    throw new Error('At least one E2E test profile must be configured.');
  }

  return profiles;
}

const testProfiles = loadTestProfiles();

export const test = base.extend<
  {},
  {
    testProfile: TestProfile;
  }
>({
  testProfile: [async ({}, use, workerInfo) => {
    const testProfile = testProfiles[workerInfo.parallelIndex];

    if (!testProfile) {
      throw new Error(
        `No E2E test profile configured for parallel worker ${workerInfo.parallelIndex}. ` +
          `Add more profiles to ${TEST_PROFILES_PATH} or reduce the Playwright worker count.`,
      );
    }

    await use(testProfile);
  }, { scope: 'worker' }],
});
