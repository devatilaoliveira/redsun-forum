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
  selector: "rs-data-list",
  standalone: true,
  imports: [
    TranslatePipe
  ],
  templateUrl: "./rs.data-list.html",
  styleUrl: "./rs.data-list.scss"
})
export class RsDataList {
  private static nextId: number = 0;
  private readonly uniqueId: string = `rs-data-list-${RsDataList.nextId++}`;

  public readonly label: InputSignal<string | null> = input<string | null>(null);
  public readonly optionsEnum: InputSignal<EnumLike> = input.required<EnumLike>();
  public readonly value: InputSignal<string | null> = input<string | null>(null);
  public readonly required: InputSignal<boolean> = input<boolean>(false);
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly placeholder: InputSignal<string | null> = input<string | null>(null);
  public readonly id: InputSignal<string | null> = input<string | null>(null);
  public readonly allowNull: InputSignal<boolean> = input<boolean>(true);
  public readonly localizationPrefix: InputSignal<string> = input.required<string>();

  public readonly valueChanged: OutputEmitterRef<string | null> = output<string | null>();

  protected readonly currentValue: WritableSignal<string | null> = signal<string | null>(this.value());
  protected readonly inputId: Signal<string> = computed<string>(() => this.id() ?? this.uniqueId);
  protected readonly datalistId: Signal<string> = computed<string>(() => `${this.inputId()}-list`);
  protected readonly options: Signal<string[]> = computed<string[]>(() =>
    Object.values(this.optionsEnum()).filter((opt): opt is string => typeof opt === "string")
  );

  constructor() {
    effect(() => {
      const incoming: string | null = this.value();
      this.currentValue.set(incoming);
    });
  }

  protected onChange(event: Event): void {
    if (this.disabled()) return;
    const rawValue: string = (event.target as HTMLInputElement | null)?.value ?? "";
    const nextValue: string | null = rawValue === "" ? null : rawValue;
    this.currentValue.set(nextValue);
    this.valueChanged.emit(nextValue);
  }
}
