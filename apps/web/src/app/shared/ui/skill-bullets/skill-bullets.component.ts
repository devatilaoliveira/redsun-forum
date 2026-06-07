import {
  Component,
  computed,
  effect,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  WritableSignal
} from "@angular/core";
import {RsInput} from "../../fragments/rsInput/rs.input";
import {selectContiguousRank} from "../rank-selection";

@Component({
  selector: "rs-skill-bullets",
  standalone: true,
  imports: [RsInput],
  templateUrl: "./skill-bullets.component.html",
  styleUrl: "./skill-bullets.component.scss"
})
export class SkillBulletsComponent {
  public readonly skillName: InputSignal<string> = input.required<string>();
  public readonly levelValue: InputSignal<number> = input<number>(0);
  public readonly minLevel: InputSignal<boolean> = input.required<boolean>();
  public readonly editable: InputSignal<boolean> = input<boolean>(false);
  public readonly levelEditable: InputSignal<boolean> = input<boolean>(true);
  public readonly skillNameChanged: OutputEmitterRef<string> = output<string>();
  public readonly levelValueChanged: OutputEmitterRef<number> = output<number>();

  protected readonly bullets: readonly number[] = [1, 2, 3, 4, 5];
  protected readonly selectedLevel: WritableSignal<number> = signal<number>(0);
  protected readonly currentSkillName: WritableSignal<string> = signal<string>("");
  protected readonly effectiveLevel: Signal<number> = computed<number>(() => {
    if (this.minLevel()) {
      return Math.max(1, this.selectedLevel());
    }

    return this.selectedLevel();
  });

  constructor() {
    effect(() => {
      this.currentSkillName.set(this.skillName());
    });
    effect(() => {
      this.selectedLevel.set(this.levelValue());
    });
  }

  protected onSkillNameChanged(value: string): void {
    this.currentSkillName.set(value);
    this.skillNameChanged.emit(value);
  }

  protected setLevel(selectedLevel: number): void {
    if (!this.levelEditable()) return;

    const currentLevel: number = this.effectiveLevel();
    const minimumLevel: number = this.minLevel() ? 1 : 0;
    const nextLevel: number = selectContiguousRank(currentLevel, selectedLevel, minimumLevel);

    this.selectedLevel.set(nextLevel);
    this.levelValueChanged.emit(nextLevel);
  }
}
