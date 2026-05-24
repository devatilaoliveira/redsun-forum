import {Component, computed, effect, input, InputSignal, output, OutputEmitterRef, Signal, signal, WritableSignal} from "@angular/core";

@Component({
  selector: "rs-number",
  standalone: true,
  imports: [],
  templateUrl: "./rs.number.html",
  styleUrl: "./rs.number.scss"
})
export class RsNumber {
  private static nextId: number = 0;
  private readonly uniqueId: string = `rs-input-${RsNumber.nextId++}`;

  public readonly label: InputSignal<string> = input<string>("");
  public readonly maxValue: InputSignal<number> = input<number>(Infinity);
  public readonly inputMode: InputSignal<"numeric" | "decimal"> = input<"numeric" | "decimal">("numeric");
  public readonly placeholder: InputSignal<string> = input<string>("");
  public readonly value: InputSignal<string> = input<string>("");
  public readonly required: InputSignal<boolean> = input<boolean>(false);
  public readonly blocked: InputSignal<boolean> = input<boolean>(false);
  public readonly pattern: InputSignal<RegExp | null> = input<RegExp | null>(null);
  public readonly autocomplete: InputSignal<string | null> = input<string | null>("off");
  public readonly id: InputSignal<string | null> = input<string | null>(null);

  public readonly valueChanged: OutputEmitterRef<string> = output<string>();

  protected readonly currentValue: WritableSignal<string> = signal<string>(this.value());

  protected readonly inputId: Signal<string> = computed<string>(() => this.id() ?? this.uniqueId);

  protected readonly patternAttr: Signal<string> = computed<string>(() => {
    const pattern: RegExp | null = this.pattern();
    if (!pattern) return this.inputMode() === "decimal" ? "[0-9]*[\\.,]?[0-9]*" : "[0-9]*";
    return pattern.source;
  });

  protected readonly inputModeAttr: Signal<"numeric" | "decimal"> = computed<"numeric" | "decimal">(() => (
    this.inputMode()
  ));

  constructor() {
    effect(() => {
      this.currentValue.set(this._sanitizeValue(this.value()));
    });
  }

  protected onInput(event: Event): void {
    if (this.blocked()) return;
    const input: HTMLInputElement = event.target as HTMLInputElement;
    const sanitizedValue: string = this._sanitizeValue(input.value);
    if (input.value !== sanitizedValue) {
      input.value = sanitizedValue;
    }
    this.currentValue.set(sanitizedValue);
    this.valueChanged.emit(sanitizedValue);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.blocked()) {
      event.preventDefault();
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key.length !== 1) return;
    if (/^\d$/.test(event.key)) return;

    if ((event.key === "." || event.key === ",") && this.inputMode() === "decimal" && this._canInsertDecimalSeparator(event)) {
      return;
    }

    event.preventDefault();
  }

  private _sanitizeValue(value: string | null | undefined): string {
    if (!value) return "";

    if (this.inputMode() !== "decimal") {
      return value.replace(/\D+/g, "");
    }

    const dotsNormalized: string = value.replace(/,/g, ".");
    const numbersAndDot: string = dotsNormalized.replace(/[^\d.]/g, "");
    const firstDotIndex: number = numbersAndDot.indexOf(".");

    if (firstDotIndex === -1) {
      return numbersAndDot;
    }

    const integerPart: string = numbersAndDot.slice(0, firstDotIndex);
    const fractionPart: string = numbersAndDot.slice(firstDotIndex + 1).replace(/\./g, "");
    return `${integerPart}.${fractionPart}`;
  }

  private _canInsertDecimalSeparator(event: KeyboardEvent): boolean {
    const input: HTMLInputElement | null = event.target as HTMLInputElement | null;
    if (!input) return true;

    const {selectionStart, selectionEnd, value} = input;
    if (selectionStart == null || selectionEnd == null) {
      return !/[.,]/.test(value);
    }

    const nextValue: string = `${value.slice(0, selectionStart)}.${value.slice(selectionEnd)}`;
    return (nextValue.match(/[.,]/g)?.length ?? 0) <= 1;
  }
}
