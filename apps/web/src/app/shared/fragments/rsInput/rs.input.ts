import {Component, computed, effect, inject, input, InputSignal, output, OutputEmitterRef, Signal, signal, WritableSignal} from "@angular/core";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";

@Component({
  selector: "rs-input",
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: "./rs.input.html",
  styleUrl: "./rs.input.scss"
})
export class RsInput {
  private static nextId: number = 0;
  private readonly uniqueId: string = `rs-input-${RsInput.nextId++}`;
  private readonly _translate: TranslateService = inject(TranslateService);

  public readonly label: InputSignal<string> = input<string>("");
  public readonly type: InputSignal<string> = input<string>("text");
  public readonly placeholder: InputSignal<string> = input<string>("");
  public readonly value: InputSignal<string> = input<string>("");
  public readonly maxLength: InputSignal<number | null> = input<number | null>(null);
  public readonly required: InputSignal<boolean> = input<boolean>(false);
  public readonly blocked: InputSignal<boolean> = input<boolean>(false);
  public readonly pattern: InputSignal<RegExp | null> = input<RegExp | null>(null);
  public readonly errorMessage: InputSignal<string | null> = input<string | null>(null);
  public readonly autocomplete: InputSignal<string | null> = input<string | null>("off");
  public readonly id: InputSignal<string | null> = input<string | null>(null);
  public readonly testId: InputSignal<string | null> = input<string | null>(null);
  public readonly validateAfterLength: InputSignal<number | null> = input<number | null>(null);
  public readonly suffixActionIcon: InputSignal<string> = input<string>("");
  public readonly hideErrorMessages: InputSignal<boolean> = input<boolean>(false);

  public readonly valueChanged: OutputEmitterRef<string> = output<string>();
  public readonly suffixActionPressed: OutputEmitterRef<void> = output<void>();

  protected readonly passwordVisible: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly touched: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly validationError: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly currentValue: WritableSignal<string> = signal<string>(this.value());

  protected readonly inputId: Signal<string> = computed<string>(() => this.id() ?? this.uniqueId);
  protected readonly errorId: Signal<string> = computed<string>(() => `${this.inputId()}-error`);
  protected readonly showError: Signal<boolean> = computed<boolean>(() => this.touched() && !!this.validationError());
  protected readonly isInvalid: Signal<boolean> = computed<boolean>(() => this.showError());
  protected readonly showPasswordToggle: Signal<boolean> = computed<boolean>(() => this.type() === "password");
  protected readonly inputType: Signal<string> = computed<string>(() => {
    if (this.type() === "password" && this.passwordVisible()) return "text";
    return this.type();
  });
  protected readonly patternAttr: Signal<string | null> = computed<string | null>(() => {
    const pattern: RegExp | null = this.pattern();
    if (!pattern) return null;
    return pattern.source;
  });

  constructor() {
    effect(() => {
      this.currentValue.set(this.value());
    });
  }

  protected onInput(value: string): void {
    if (this.blocked()) return;
    this.currentValue.set(value);
    this.touched.set(true);
    this.validationError.set(this._validate(value));
    this.valueChanged.emit(value);
  }

  protected onBlur(): void {
    this.touched.set(true);
    this.validationError.set(this._validate(this.currentValue()));
  }

  protected togglePassword(): void {
    this.passwordVisible.update((visible: boolean) => !visible);
  }

  protected onSuffixActionPressed(): void {
    this.suffixActionPressed.emit();
  }

  private _validate(value: string): string | null {
    const trimmed: string = value.trim();
    if (this.required() && !trimmed) {
      return this._translate.instant("RS_INPUT_REQUIRED");
    }

    if (trimmed.length === 0) return null;

    const pattern: RegExp | null = this.pattern();
    const validateAfterLength: number | null = this.validateAfterLength();
    if (validateAfterLength !== null && trimmed.length < validateAfterLength) {
      return null;
    }
    if (pattern && !pattern.test(trimmed)) {
      return this.errorMessage() ?? this._translate.instant("RS_INPUT_PATTERN");
    }
    return null;
  }
}
