import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface SeededLoginUser {
  email: string;
  password: string;
}

interface SeededDataMap {
  SEEDED_LOGIN_USER: SeededLoginUser;
}

const SEEDED_DATA_PATH = resolve(__dirname, "./seeded-data.json");

export const SEEDED_DATA = JSON.parse(
  readFileSync(SEEDED_DATA_PATH, "utf-8"),
) as SeededDataMap;
