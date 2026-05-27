import {Component, computed, input, InputSignal, Signal} from "@angular/core";

export type RsTooltipPosition = "top" | "bottom" | "left" | "right";
export type RsTooltipAlign = "start" | "center" | "end";

@Component({
  selector: "rs-tooltip",
  standalone: true,
  imports: [],
  templateUrl: "./rs.tooltip.html",
  styleUrl: "./rs.tooltip.scss"
})
export class RsTooltip {
  public readonly text: InputSignal<string> = input.required<string>();
  public readonly position: InputSignal<RsTooltipPosition> = input<RsTooltipPosition>("top");
  public readonly align: InputSignal<RsTooltipAlign> = input<RsTooltipAlign>("center");
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);

  protected readonly tooltipText: Signal<string> = computed(() => {
    if (this.disabled()) return "";
    return this.text().trim();
  });
}
