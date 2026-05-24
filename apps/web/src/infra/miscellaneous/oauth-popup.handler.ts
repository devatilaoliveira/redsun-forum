import {Injectable} from "@angular/core";

export interface IOAuthPopupHandler {
  openPopup(url: string): void;
  reset(): void;
}

@Injectable({providedIn: "root"})
export class OAuthPopupHandler implements IOAuthPopupHandler {
  private _popup: Window | null = null;
  private _popupMonitorId: number | null = null;

  public openPopup(url: string): void {
    if (this._popup && !this._popup.closed) {
      this._popup.focus();
      return;
    }

    this._reset();

    const popup: Window | null = window.open(url, "_blank", "width=500,height=650");

    if (!popup) {
      throw new Error("Popup blocked");
    }

    popup.focus();
    this._popup = popup;
    this._startPopupMonitor();
  }

  public reset(): void {
    this._reset();
  }

  private _reset(): void {
    this._stopPopupMonitor();
    this._popup = null;
  }

  private _startPopupMonitor(): void {
    this._stopPopupMonitor();

    if (!this._popup) {
      return;
    }

    this._popupMonitorId = window.setInterval(() => {
      let isClosed: boolean = false;

      try {
        isClosed = !this._popup || this._popup.closed;
      } catch {
        isClosed = true;
      }

      if (isClosed) {
        this._reset();
      }
    }, 500);
  }

  private _stopPopupMonitor(): void {
    if (this._popupMonitorId !== null) {
      window.clearInterval(this._popupMonitorId);
      this._popupMonitorId = null;
    }
  }
}
