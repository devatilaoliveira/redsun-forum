import {Component, computed, effect, input, InputSignal, signal, Signal, WritableSignal} from "@angular/core";
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
  public readonly minLevel: InputSignal<boolean> = input.required<boolean>();
  public readonly editable: InputSignal<boolean> = input<boolean>(false);
  public readonly levelEditable: InputSignal<boolean> = input<boolean>(true);

  protected readonly bullets: readonly number[] = [1, 2, 3, 4, 5];
  protected readonly level: WritableSignal<number> = signal<number>(0);
  protected readonly currentSkillName: WritableSignal<string> = signal<string>("");
  protected readonly effectiveLevel: Signal<number> = computed<number>(() => {
    if (this.minLevel()) {
      return Math.max(1, this.level());
    }

    return this.level();
  });

  constructor() {
    effect(() => {
      this.currentSkillName.set(this.skillName());
    });
  }

  protected onSkillNameChanged(value: string): void {
    this.currentSkillName.set(value);
  }

  protected setLevel(selectedLevel: number): void {
    if (!this.levelEditable()) return;

    const currentLevel: number = this.effectiveLevel();
    const minimumLevel: number = this.minLevel() ? 1 : 0;
    const nextLevel: number = selectContiguousRank(currentLevel, selectedLevel, minimumLevel);

    this.level.set(nextLevel);
  }
}
