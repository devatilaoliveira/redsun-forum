import {Component, computed, input, InputSignal, output, OutputEmitterRef, Signal} from "@angular/core";

@Component({
  selector: "rs-box-clickable",
  standalone: true,
  templateUrl: "./rs.box-clickable.html",
  styleUrl: "./rs.box-clickable.scss",
  host: {
    "(click)": "onClick()",
    "[style.min-height]": "minHeightCss()"
  }
})
export class RsBoxClickable {
  public readonly minHeight: InputSignal<number | string | null> = input<number | string | null>(null);
  public readonly pressed: OutputEmitterRef<void> = output<void>();

  protected readonly minHeightCss: Signal<string | null> = computed<string | null>(() => {
    const value: string | number | null = this.minHeight();
    if (value == null) return null;
    return typeof value === "number" ? `${value}px` : value;
  });

  protected onClick(): void {
    this.pressed.emit();
  }
}
