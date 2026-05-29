import {HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {inject, Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {firstValueFrom} from "rxjs";
import {environment} from "../environments/environment";
import {ClientErrorReportRequestDTO} from "../interface/dtos/client-error/ClientErrorReportRequestDTO";
import {AuthSessionService, IAuthSessionService} from "./session.service";

export interface IErrorReporterService {
  reportError(error: unknown): Promise<void>;
}

type PlainRecord = Record<string, unknown>;

const MAX_MESSAGE_LENGTH = 2000;
const MAX_NAME_LENGTH = 200;
const MAX_STACK_LENGTH = 10000;
const MAX_CAUSE_LENGTH = 2000;
const MAX_ROUTE_LENGTH = 1000;
const MAX_METHOD_LENGTH = 20;
const MAX_USER_AGENT_LENGTH = 1000;
const MAX_ENVIRONMENT_LENGTH = 50;
const MAX_METADATA_LENGTH = 4000;
const DEDUPE_WINDOW_MS = 60_000;
const SENSITIVE_KEY_PATTERN = /(password|token|cookie|secret|authorization|access[_-]?token|refresh[_-]?token)/i;

@Injectable({providedIn: "root"})
export class ErrorReporterService implements IErrorReporterService {
  private readonly _httpClient: HttpClient = new HttpClient(inject(HttpBackend));
  private readonly _authSessionService: IAuthSessionService = inject(AuthSessionService);
  private readonly _router: Router = inject(Router);
  private readonly _recentReports = new Map<string, number>();
  private _isReporting = false;

  public async reportError(error: unknown): Promise<void> {
    if (this._isReporting) {
      return;
    }

    const payload: ClientErrorReportRequestDTO = this._buildPayload(error);
    const fingerprint: string = this._buildFingerprint(payload);
    if (this._isDuplicate(fingerprint)) {
      return;
    }

    this._isReporting = true;
    try {
      const session = await this._authSessionService.getCurrentSession();
      if (!session?.access_token) {
        return;
      }

      this._recentReports.set(fingerprint, Date.now());
      await firstValueFrom(this._httpClient.post<void>(
        `${environment.apiBaseUrl}/client-errors`,
        payload,
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${session.access_token}`
          })
        }
      ));
    } catch {
      return;
    } finally {
      this._isReporting = false;
    }
  }

  private _buildPayload(input: unknown): ClientErrorReportRequestDTO {
    const error: unknown = this._unwrapError(input);
    const route: string = this._truncate(this._router.url || globalThis.location?.pathname || "", MAX_ROUTE_LENGTH);

    return {
      message: this._resolveMessage(error),
      name: this._resolveName(error),
      stack: this._resolveStack(error),
      cause: this._resolveCause(error),
      route,
      method: this._resolveMethod(error),
      statusCode: this._resolveStatusCode(error),
      userAgent: this._truncate(globalThis.navigator?.userAgent ?? "", MAX_USER_AGENT_LENGTH),
      environment: this._truncate(environment.production ? "production" : "development", MAX_ENVIRONMENT_LENGTH),
      timestamp: new Date().toISOString(),
      metadata: this._buildMetadata(error, route)
    };
  }

  private _unwrapError(input: unknown): unknown {
    if (this._isPlainRecord(input)) {
      const ngError = input["ngOriginalError"];
      if (ngError) {
        return ngError;
      }

      const rejection = input["rejection"];
      if (rejection) {
        return rejection;
      }
    }

    return input;
  }

  private _resolveMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return this._truncate(error.message || "HTTP error", MAX_MESSAGE_LENGTH);
    }

    if (error instanceof Error) {
      return this._truncate(error.message || "Unhandled error", MAX_MESSAGE_LENGTH);
    }

    if (typeof error === "string") {
      return this._truncate(error, MAX_MESSAGE_LENGTH);
    }

    return this._truncate(this._safeSerialize(error) || "Unhandled error", MAX_MESSAGE_LENGTH);
  }

  private _resolveName(error: unknown): string {
    if (error instanceof Error || error instanceof HttpErrorResponse) {
      return this._truncate(error.name || "Error", MAX_NAME_LENGTH);
    }

    return "Error";
  }

  private _resolveStack(error: unknown): string | undefined {
    if (error instanceof Error && error.stack) {
      return this._truncate(error.stack, MAX_STACK_LENGTH);
    }

    return undefined;
  }

  private _resolveCause(error: unknown): string | undefined {
    if (!(error instanceof Error) || !("cause" in error)) {
      return undefined;
    }

    return this._truncate(this._safeSerialize((error as Error & {cause?: unknown}).cause), MAX_CAUSE_LENGTH);
  }

  private _resolveMethod(error: unknown): string | undefined {
    if (!this._isPlainRecord(error)) {
      return undefined;
    }

    const method = error["method"];
    return typeof method === "string" ? this._truncate(method, MAX_METHOD_LENGTH) : undefined;
  }

  private _resolveStatusCode(error: unknown): number | undefined {
    if (error instanceof HttpErrorResponse && error.status >= 100 && error.status <= 599) {
      return error.status;
    }

    return undefined;
  }

  private _buildMetadata(error: unknown, route: string): string | undefined {
    const metadata = {
      queryParams: this._router.parseUrl(route || "").queryParams,
      httpUrl: error instanceof HttpErrorResponse ? error.url : undefined
    };

    const serialized = this._safeSerialize(metadata);
    return serialized ? this._truncate(serialized, MAX_METADATA_LENGTH) : undefined;
  }

  private _safeSerialize(value: unknown): string {
    try {
      const seen = new WeakSet<object>();
      const serialized = JSON.stringify(value, (key: string, nestedValue: unknown): unknown => {
        if (SENSITIVE_KEY_PATTERN.test(key)) {
          return "[redacted]";
        }

        if (typeof nestedValue === "string") {
          return this._sanitizeString(nestedValue);
        }

        if (typeof nestedValue === "object" && nestedValue !== null) {
          if (seen.has(nestedValue)) {
            return "[circular]";
          }
          seen.add(nestedValue);
        }

        return nestedValue;
      });

      return serialized ?? "";
    } catch {
      return "";
    }
  }

  private _sanitizeString(value: string): string {
    return SENSITIVE_KEY_PATTERN.test(value) ? "[redacted]" : value;
  }

  private _buildFingerprint(payload: ClientErrorReportRequestDTO): string {
    const firstStackLine: string = payload.stack?.split("\n")[1]?.trim() ?? "";
    return [
      payload.name,
      payload.message,
      payload.route,
      payload.statusCode,
      firstStackLine
    ].join("|");
  }

  private _isDuplicate(fingerprint: string): boolean {
    const now = Date.now();
    for (const [key, reportedAt] of this._recentReports.entries()) {
      if (now - reportedAt > DEDUPE_WINDOW_MS) {
        this._recentReports.delete(key);
      }
    }

    const recentReportTime = this._recentReports.get(fingerprint);
    return recentReportTime !== undefined && now - recentReportTime <= DEDUPE_WINDOW_MS;
  }

  private _truncate(value: string, maxLength: number): string {
    return value.length <= maxLength ? value : value.slice(0, maxLength);
  }

  private _isPlainRecord(value: unknown): value is PlainRecord {
    return typeof value === "object" && value !== null;
  }
}
