import {DOCUMENT} from "@angular/common";
import {inject, Injectable} from "@angular/core";
import {IPrinter, Printer} from "./printer.handler";

export interface IFocusHandler {
  focus(element: HTMLElement | null | undefined): boolean;
}

@Injectable({providedIn: "root"})
export class FocusHandler implements IFocusHandler {
  private readonly _document: Document = inject(DOCUMENT);
  private readonly _printer: IPrinter = inject(Printer);

  public focus(element: HTMLElement | null | undefined): boolean {
    if (!element || !element.isConnected || element.hasAttribute("disabled")) {
      return false;
    }

    if (this._document.activeElement === element) {
      return true;
    }

    try {
      element.focus({preventScroll: true});
      return this._document.activeElement === element;
    } catch (error) {
      this._printer.warn("Programmatic focus failed.", error);
      return false;
    }
  }
}
