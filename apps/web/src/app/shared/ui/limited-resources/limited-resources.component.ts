import {Component, computed, input, InputSignal, output, OutputEmitterRef, Signal} from "@angular/core";
import {clampRank, selectContiguousRank} from "../rank-selection";

const MAX_RESOURCE_SLOTS = 10;

@Component({
  selector: "rs-limited-resources",
  standalone: true,
  templateUrl: "./limited-resources.component.html",
  styleUrl: "./limited-resources.component.scss"
})
export class LimitedResourcesComponent {
  public readonly resourceName: InputSignal<string> = input.required<string>();
  public readonly maximumValue: InputSignal<number> = input<number>(0);
  public readonly currentValue: InputSignal<number> = input<number>(0);
  public readonly slots: InputSignal<number> = input<number>(10);
  public readonly editable: InputSignal<boolean> = input<boolean>(false);

  public readonly maximumValueChanged: OutputEmitterRef<number> = output<number>();
  public readonly currentValueChanged: OutputEmitterRef<number> = output<number>();

  protected readonly slotCount: Signal<number> = computed<number>(() => {
    return clampRank(Math.floor(this.slots()), 0, MAX_RESOURCE_SLOTS);
  });
  protected readonly boxes: Signal<readonly number[]> = computed<readonly number[]>(() => {
    return Array.from({length: this.slotCount()}, (_, index: number) => index + 1);
  });
  protected readonly maximumLevel: Signal<number> = computed<number>(() => {
    return clampRank(Math.floor(this.maximumValue()), 0, this.slotCount());
  });
  protected readonly currentLevel: Signal<number> = computed<number>(() => {
    return clampRank(Math.floor(this.currentValue()), 0, this.maximumLevel());
  });

  protected setMaximumLevel(selectedLevel: number): void {
    if (!this.editable()) return;

    const nextLevel: number = clampRank(
      selectContiguousRank(this.maximumLevel(), selectedLevel, 0),
      0,
      this.boxes().length
    );

    this.maximumValueChanged.emit(nextLevel);

    if (this.currentLevel() > nextLevel) {
      this.currentValueChanged.emit(nextLevel);
    }
  }

  protected setCurrentLevel(selectedLevel: number): void {
    if (!this.editable()) return;

    const nextLevel: number = clampRank(
      selectContiguousRank(this.currentLevel(), selectedLevel, 0),
      0,
      this.maximumLevel()
    );

    this.currentValueChanged.emit(nextLevel);
  }
}
