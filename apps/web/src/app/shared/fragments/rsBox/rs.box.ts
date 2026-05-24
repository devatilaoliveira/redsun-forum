import {Component, computed, input, InputSignal, Signal} from "@angular/core";

@Component({
  selector: "rs-box",
  standalone: true,
  templateUrl: "./rs.box.html",
  styleUrl: "./rs.box.scss",
  host: {
    "[style.min-height]": "minHeightCss()"
  }
})
export class RsBox {
  public readonly minHeight: InputSignal<number | string | null> = input<number | string | null>(null);

  protected readonly minHeightCss: Signal<string | null> = computed<string | null>(() => {
    const value: string | number | null = this.minHeight();
    if (value == null) return null;
    return typeof value === "number" ? `${value}px` : value;
  });
}
