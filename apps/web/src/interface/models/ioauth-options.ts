export interface IOAuthOptions {
  redirectTo?: string;
  scopes?: string;
  queryParams?: Record<string, string>;
  skipBrowserRedirect?: boolean;
}