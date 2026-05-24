import { Injectable, isDevMode } from "@angular/core";

export interface IPrinter {
  log: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

@Injectable({ providedIn: "root" })
export class Printer {
  private readonly active = isDevMode();

  log = (...args: unknown[]) => {
    if (this.active) console.log(...args);
  };

  info = (...args: unknown[]) => {
    if (this.active) console.info(...args);
  };

  warn = (...args: unknown[]) => {
    if (this.active) console.warn(...args);
  };

  error = (...args: unknown[]) => {
    console.error(...args);
  };

  debug = (...args: unknown[]) => {
    if (this.active) console.debug(...args);
  };
}
