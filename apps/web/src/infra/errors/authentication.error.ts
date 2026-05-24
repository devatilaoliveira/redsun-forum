// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
export class AuthenticationError extends Error {
  constructor(public readonly redirectUrl: string, cause?: unknown) {
    super("AUTH_REDIRECT", { cause });
    this.name = "AuthenticationError";
  }
}