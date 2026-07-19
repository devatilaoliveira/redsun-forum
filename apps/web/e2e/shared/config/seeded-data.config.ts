import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface SeededLoginUser {
  email: string;
  password: string;
}

interface SeededTaleOwner extends SeededLoginUser {
  id: string;
  username: string;
}

interface SeededTaleParticipant {
  id: string;
  username: string;
  email: string;
}

interface SeededTale {
  id: string;
  name: string;
}

interface SeededDataMap {
  SEEDED_LOGIN_USER: SeededLoginUser;
  SEEDED_TALE_OWNER: SeededTaleOwner;
  SEEDED_TALE_PARTICIPANT: SeededTaleParticipant;
  SEEDED_TALE: SeededTale;
}

const SEEDED_DATA_PATH = resolve(__dirname, "./seeded-data.json");

export const SEEDED_DATA = JSON.parse(
  readFileSync(SEEDED_DATA_PATH, "utf-8"),
) as SeededDataMap;
