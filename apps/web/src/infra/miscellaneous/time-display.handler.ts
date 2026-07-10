import {inject, Injectable} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";
import {ELanguage} from "../../interface/enums/ELanguage";
import {AppSettingsService, IAppSettingsService} from "../../services/app-settings.service";

export type TimeDisplayMode = "date" | "relative" | "dateTime";

export interface ITimeDisplayHandler {
  display(date: string | Date, mode: TimeDisplayMode, options?: TimeDisplayOptions): string;
}

export interface TimeDisplayOptions {
  now?: Date;
}

interface TimeDisplayLocaleConfig {
  locale: string;
  timeZone: string;
}

@Injectable({providedIn: "root"})
export class TimeDisplayHandler implements ITimeDisplayHandler {
  private readonly _appSettingsService: IAppSettingsService = inject(AppSettingsService);
  private readonly _translateService: TranslateService = inject(TranslateService);

  private readonly _hourMs: number = 60 * 60 * 1000;
  private readonly _dayMs: number = 24 * this._hourMs;
  private readonly _weekMs: number = 7 * this._dayMs;

  public display(date: string | Date, mode: TimeDisplayMode, options: TimeDisplayOptions = {}): string {
    const parsedDate: Date = this._parseDate(date);

    if (mode === "relative") {
      return this._formatRelative(parsedDate, options.now ?? new Date());
    }

    if (mode === "date") {
      return this._formatDate(parsedDate);
    }

    return this._formatDateTime(parsedDate);
  }

  private _parseDate(date: string | Date): Date {
    const parsedDate: Date = date instanceof Date ? date : new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error("TimeDisplayHandler received an invalid date.");
    }

    return parsedDate;
  }

  private _formatRelative(date: Date, now: Date): string {
    const ageMs: number = now.getTime() - date.getTime();

    if (ageMs < 0) {
      return this._formatDate(date);
    }

    if (ageMs < this._hourMs) {
      return this._translateService.instant("TIME_DISPLAY_LESS_THAN_HOUR_AGO");
    }

    if (ageMs < this._dayMs) {
      const hours: number = Math.floor(ageMs / this._hourMs);
      const key: string = hours === 1 ? "TIME_DISPLAY_HOUR_AGO" : "TIME_DISPLAY_HOURS_AGO";
      return this._translateService.instant(key, {count: hours});
    }

    if (ageMs <= this._weekMs) {
      const days: number = Math.floor(ageMs / this._dayMs);
      const key: string = days === 1 ? "TIME_DISPLAY_DAY_AGO" : "TIME_DISPLAY_DAYS_AGO";
      return this._translateService.instant(key, {count: days});
    }

    return this._translateService.instant("TIME_DISPLAY_MORE_THAN_WEEK_AGO");
  }

  private _formatDate(date: Date): string {
    const parts: Record<string, string> = this._getDateParts(date);
    return `${parts["year"]} ${parts["month"]} ${parts["day"]}`;
  }

  private _formatDateTime(date: Date): string {
    const parts: Record<string, string> = this._getDateParts(date);
    return `${parts["year"]} ${parts["month"]} ${parts["day"]} ${parts["hour"]}:${parts["minute"]}h`;
  }

  private _getDateParts(date: Date): Record<string, string> {
    const config: TimeDisplayLocaleConfig = this._getLocaleConfig();
    const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(config.locale, {
      day: "numeric",
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      month: "short",
      timeZone: config.timeZone,
      year: "numeric"
    });

    return formatter.formatToParts(date).reduce((parts: Record<string, string>, part: Intl.DateTimeFormatPart) => {
      if (part.type !== "literal") {
        parts[part.type] = part.value;
      }

      return parts;
    }, {});
  }

  private _getLocaleConfig(): TimeDisplayLocaleConfig {
    const language: ELanguage = this._appSettingsService.getLanguage();

    if (language === ELanguage.EN) {
      return {
        locale: "en-US",
        timeZone: "America/New_York"
      };
    }

    if (language === ELanguage.DE) {
      return {
        locale: "de-DE",
        timeZone: "Europe/Berlin"
      };
    }

    return {
      locale: "pt-BR",
      timeZone: "America/Sao_Paulo"
    };
  }
}
