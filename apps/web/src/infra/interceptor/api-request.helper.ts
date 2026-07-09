import {environment} from "../../environments/environment";

export function isApiRequest(url: string): boolean {
  const apiUrl: URL | null = parseUrl(environment.apiBaseUrl);
  const requestUrl: URL | null = parseRequestUrl(url);
  if (!apiUrl || !requestUrl || requestUrl.origin !== apiUrl.origin) {
    return false;
  }

  const apiPath: string = apiUrl.pathname.replace(/\/+$/, "");
  return requestUrl.pathname === apiPath || requestUrl.pathname.startsWith(`${apiPath}/`);
}

function parseRequestUrl(url: string): URL | null {
  const absoluteUrl: URL | null = parseUrl(url);
  if (absoluteUrl) {
    return absoluteUrl;
  }

  const browserOrigin: string | undefined = globalThis.location?.origin;
  return browserOrigin ? parseUrl(url, browserOrigin) : null;
}

function parseUrl(url: string, base?: string): URL | null {
  try {
    return new URL(url, base);
  } catch {
    return null;
  }
}
