import {UTIL_CONSTANTS} from "./util.constants";

export const EMAIL_PATTERN: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const USER_NAME_PATTERN: RegExp = new RegExp(`^[A-Za-z0-9]{${UTIL_CONSTANTS.MIN_LENGTH},${UTIL_CONSTANTS.USERNAME_MAX_LENGTH}}$`);
