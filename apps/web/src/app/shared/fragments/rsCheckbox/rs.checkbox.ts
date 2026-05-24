import {Component, computed, input, InputSignal, output, OutputEmitterRef, Signal} from "@angular/core";

@Component({
  selector: "rs-checkbox",
  standalone: true,
  imports: [],
  templateUrl: "./rs.checkbox.html",
  styleUrl: "./rs.checkbox.scss"
})
export class RsCheckbox {
  private static nextId: number = 0;
  private readonly uniqueId: string = `rs-checkbox-${RsCheckbox.nextId++}`;

  public readonly label: InputSignal<string | null> = input<string | null>(null);
  public readonly checked: InputSignal<boolean> = input<boolean>(false);
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly required: InputSignal<boolean> = input<boolean>(false);
  public readonly name: InputSignal<string | null> = input<string | null>(null);
  public readonly id: InputSignal<string | null> = input<string | null>(null);
  public readonly testId: InputSignal<string | null> = input<string | null>(null);

  public readonly checkedChange: OutputEmitterRef<boolean> = output<boolean>();

  protected readonly inputId: Signal<string> = computed<string>(() => this.id() ?? this.uniqueId);

  protected onToggle(event: Event): void {
    const nextValue: boolean = (event.target as HTMLInputElement | null)?.checked ?? false;
    this.checkedChange.emit(nextValue);
  }
}
