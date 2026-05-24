import {Injectable, Signal, signal, WritableSignal, computed} from "@angular/core";
import {EVariant} from "../interface/enums/EVariant";

export interface ToastMessage {
  id: number;
  label: string;
  message: string;
  variant: EVariant;
  durationMs: number;
}

export interface ToastShowOptions {
  label: string;
  message: string;
  variant?: EVariant;
  durationMs?: number;
}

export interface IToastService {
  readonly toast: Signal<ToastMessage | null>;
  show(options: ToastShowOptions): void;
  dismiss(id?: number): void;
}

@Injectable({providedIn: "root"})
export class ToastService implements IToastService {
  private readonly _toast: WritableSignal<ToastMessage | null> = signal<ToastMessage | null>(null);
  private showTimerId: ReturnType<typeof setTimeout> | null = null;
  private nextId = 1;

  public readonly toast: Signal<ToastMessage | null> = computed(() => this._toast());

  public show(options: ToastShowOptions): void {
    const nextToast: ToastMessage = {
      id: this.nextId++,
      label: options.label.trim(),
      message: options.message.trim(),
      variant: options.variant ?? EVariant.PRIMARY,
      durationMs: options.durationMs ?? 4000
    };

    if (!nextToast.label || !nextToast.message) {
      return;
    }

    if (this.showTimerId) {
      clearTimeout(this.showTimerId);
      this.showTimerId = null;
    }

    if (this._toast()) {
      this._toast.set(null);
      this.showTimerId = setTimeout(() => {
        this._toast.set(nextToast);
        this.showTimerId = null;
      });
      return;
    }

    this._toast.set(nextToast);
  }

  public dismiss(id?: number): void {
    const current: ToastMessage | null = this._toast();
    if (!current) return;
    if (id != null && current.id !== id) return;
    this._toast.set(null);
  }
}
