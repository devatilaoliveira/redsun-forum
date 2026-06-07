import {Component, computed, input, InputSignal, output, OutputEmitterRef, Signal} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";
import {clampRank} from "../../../../shared/ui/rank-selection";

interface VitalityTrackRow {
  labelKey: string;
  minimumStamina?: number;
}

const VITALITY_TRACK_ROWS: readonly VitalityTrackRow[] = [
  {labelKey: "UNDAMAGED"},
  {labelKey: "BRUISED"},
  {labelKey: "HURT"},
  {labelKey: "INJURED"},
  {labelKey: "INJURED_VIGOR_4", minimumStamina: 4},
  {labelKey: "SERIOUSLY_INJURED"},
  {labelKey: "GRAVELY_INJURED_VIGOR_5", minimumStamina: 5},
  {labelKey: "GRAVELY_INJURED"},
  {labelKey: "MAIMED"},
  {labelKey: "INCAPACITATED"},
  {labelKey: "UNCONSCIOUS"},
  {labelKey: "DEATH"}
];

const VITALITY_PENALTIES: readonly number[] = [0, -1, -1, -2, -2, -3, -3, -4, -7];

@Component({
  selector: "rs-vitality-track",
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: "./vitality-track.component.html",
  styleUrl: "./vitality-track.component.scss"
})
export class VitalityTrackComponent {
  public readonly damageValue: InputSignal<number> = input<number>(0);
  public readonly staminaValue: InputSignal<number> = input<number>(0);
  public readonly editable: InputSignal<boolean> = input<boolean>(false);

  public readonly damageValueChanged: OutputEmitterRef<number> = output<number>();

  protected readonly visibleRows: Signal<readonly VitalityTrackRow[]> = computed<readonly VitalityTrackRow[]>(() => {
    const stamina: number = clampRank(Math.floor(this.staminaValue()), 0, 5);
    return VITALITY_TRACK_ROWS.filter((row: VitalityTrackRow) => {
      return row.minimumStamina === undefined || stamina >= row.minimumStamina;
    });
  });

  protected readonly selectedDamage: Signal<number> = computed<number>(() => {
    return clampRank(Math.floor(this.damageValue()), 0, this.visibleRows().length - 1);
  });

  protected setDamageValue(selectedDamage: number): void {
    if (!this.editable()) return;

    this.damageValueChanged.emit(clampRank(selectedDamage, 0, this.visibleRows().length - 1));
  }

  protected penaltyFor(damage: number): string {
    const penalty: number | undefined = VITALITY_PENALTIES[damage];
    return penalty === undefined ? "" : penalty.toString();
  }
}
