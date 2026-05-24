import {
  Component,
  computed,
  effect,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal
} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";

type EnumLike = Record<string, string | number>;

@Component({
  selector: "rs-select",
  standalone: true,
  imports: [
    TranslatePipe
  ],
  templateUrl: "./rs.select.html",
  styleUrl: "./rs.select.scss"
})
export class RsSelect {
  private static nextId: number = 0;
  private readonly uniqueId: string = `rs-select-${RsSelect.nextId++}`;

  public readonly label: InputSignal<string | null> = input<string | null>(null);
  public readonly optionsEnum: InputSignal<EnumLike> = input.required<EnumLike>();
  public readonly value: InputSignal<string | null> = input<string | null>(null);
  public readonly required: InputSignal<boolean> = input<boolean>(false);
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly placeholder: InputSignal<string | null> = input<string | null>(null);
  public readonly nullOptionLabel: InputSignal<string | null> = input<string | null>(null);
  public readonly id: InputSignal<string | null> = input<string | null>(null);
  public readonly allowNull: InputSignal<boolean> = input<boolean>(true);
  public readonly localizationPrefix: InputSignal<string> = input.required<string>();

  public readonly valueChanged: OutputEmitterRef<string | null> = output<string | null>();

  protected readonly currentValue: WritableSignal<string | null> = signal<string | null>(this.value());
  protected readonly selectId: Signal<string> = computed<string>(() => this.id() ?? this.uniqueId);
  protected readonly options: Signal<string[]> = computed<string[]>(() =>
    Object.values(this.optionsEnum()).filter((opt): opt is string => typeof opt === "string")
  );

  constructor() {
    effect(() => {
      const allowNull: boolean = this.allowNull();
      const incoming: string | null = this.value();
      const options: string[] = this.options();
      if (!allowNull && !incoming && options.length > 0) {
        this.currentValue.set(options[0]);
        return;
      }
      this.currentValue.set(incoming);
    });
  }

  protected onChange(event: Event): void {
    if (this.disabled()) return;
    const rawValue: string = (event.target as HTMLSelectElement | null)?.value ?? "";
    const nextValue: string | null = rawValue === "" ? null : rawValue;
    const finalValue: string | null = !this.allowNull() && nextValue === null ? this.options()[0] ?? null : nextValue;
    this.currentValue.set(finalValue);
    this.valueChanged.emit(finalValue);
  }
}
