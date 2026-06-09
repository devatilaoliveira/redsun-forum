/* eslint-disable @angular-eslint/no-output-native */
import {
  Component,
  booleanAttribute,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  Signal
} from "@angular/core";
import {NgOptimizedImage} from "@angular/common";
import {environment} from "../../../../environments/environment";

@Component({
  selector: "rs-img",
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: "./rs.img.html",
  styleUrl: "./rs.img.scss",
  host: {
    "[class.loaded]": "isLoaded() || imgLoaded()"
  }
})
export class RsImg {
  public readonly src: InputSignal<string | null> = input<string | null>(null);
  public readonly ngSrc: InputSignal<string | null> = input<string | null>(null);
  public readonly ngSrcset: InputSignal<string | null> = input<string | null>(null);
  public readonly alt: InputSignal<string> = input<string>("");
  public readonly imgLoaded = input(false, {transform: booleanAttribute});
  public readonly width: InputSignal<number | string | null> = input<number | string | null>(null);
  public readonly height: InputSignal<number | string | null> = input<number | string | null>(null);
  public readonly sizes: InputSignal<string | null> = input<string | null>(null);
  public readonly loading: InputSignal<"eager" | "lazy" | null> = input<"eager" | "lazy" | null>(null);
  public readonly decoding: InputSignal<"sync" | "async" | "auto" | null> = input<"sync" | "async" | "auto" | null>(null);
  public readonly fill = input(false, {transform: booleanAttribute});
  public readonly priority = input(false, {transform: booleanAttribute});
  public readonly ariaHidden: InputSignal<boolean | string | null> = input<boolean | string | null>(null, {alias: "aria-hidden"});

  public readonly load: OutputEmitterRef<Event> = output<Event>();
  public readonly error: OutputEmitterRef<Event> = output<Event>();

  protected readonly loadedSrc = signal<string | null>(null);
  protected readonly safeSrc: Signal<string | null> = computed<string | null>(() =>
    this.resolveSafeImageUrl(this.ngSrc() ?? this.src())
  );
  protected readonly isLoaded: Signal<boolean> = computed<boolean>(() =>
    this.loadedSrc() === this.safeSrc()
  );
  protected readonly useNgSrc: Signal<boolean> = computed<boolean>(() =>
    !!this.ngSrc() && !!this.safeSrc()
  );

  protected onLoad(event: Event): void {
    this.loadedSrc.set(this.safeSrc());
    this.load.emit(event);
  }

  protected onError(event: Event): void {
    this.error.emit(event);
  }

  private resolveSafeImageUrl(value: string | null): string | null {
    const rawValue = value?.trim();
    if (!rawValue) {
      return null;
    }

    if (rawValue.startsWith("data:image/") || rawValue.startsWith("blob:")) {
      return rawValue;
    }

    try {
      const appOrigin = new URL(environment.baseUrl, globalThis.location?.origin).origin;
      const url = new URL(rawValue, appOrigin);

      if (url.origin === appOrigin) {
        return rawValue;
      }

      const supabaseOrigin = new URL(environment.supabaseUrl).origin;
      if (
        url.protocol === "https:" &&
        url.origin === supabaseOrigin &&
        url.pathname.startsWith("/storage/v1/object/public/")
      ) {
        return rawValue;
      }
    } catch {
      return null;
    }

    return null;
  }
}
