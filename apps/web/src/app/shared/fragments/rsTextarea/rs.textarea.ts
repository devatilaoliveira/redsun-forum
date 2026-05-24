import {
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  Signal,
  WritableSignal
} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: "rs-textarea",
  standalone: true,
  imports: [],
  templateUrl: "./rs.textarea.html",
  styleUrl: "./rs.textarea.scss"
})
export class RsTextarea {
  private static nextId: number = 0;
  private readonly uniqueId: string = `rs-textarea-${RsTextarea.nextId++}`;
  private readonly _translate: TranslateService = inject(TranslateService);

  public readonly label: InputSignal<string | null> = input<string | null>(null);
  public readonly placeholder: InputSignal<string> = input<string>("");
  public readonly value: InputSignal<string> = input<string>("");
  public readonly maxLength: InputSignal<number | null> = input<number | null>(null);
  public readonly required: InputSignal<boolean> = input<boolean>(false);
  public readonly blocked: InputSignal<boolean> = input<boolean>(false);
  public readonly id: InputSignal<string | null> = input<string | null>(null);
  public readonly rows: InputSignal<number> = input<number>(5);
  public readonly errorMessage: InputSignal<string | null> = input<string | null>(null);

  public readonly valueChanged: OutputEmitterRef<string> = output<string>();

  protected readonly touched: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly validationError: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly currentValue: WritableSignal<string> = signal<string>(this.value());

  protected readonly textareaId: Signal<string> = computed<string>(() => this.id() ?? this.uniqueId);
  protected readonly errorId: Signal<string> = computed<string>(() => `${this.textareaId()}-error`);
  protected readonly showError: Signal<boolean> = computed<boolean>(() => this.touched() && !!this.validationError());
  protected readonly isInvalid: Signal<boolean> = computed<boolean>(() => this.showError());
  protected readonly maxLengthAttr: Signal<number | null> = computed<number | null>(() => this.maxLength());
  protected readonly currentLength: Signal<number> = computed<number>(() => this.currentValue().length);

  constructor() {
    effect(() => {
      this.currentValue.set(this.value());
    });
  }

  protected onInput(event: Event): void {
    if (this.blocked()) return;
    const nextValue: string = (event.target as HTMLTextAreaElement | null)?.value ?? "";
    this.currentValue.set(nextValue);
    this.valueChanged.emit(nextValue);
  }

  protected onBlur(): void {
    this.touched.set(true);
    this.validationError.set(this._validate(this.currentValue()));
  }

  private _validate(value: string): string | null {
    const trimmed: string = value.trim();

    if (this.required() && !trimmed) {
      return this.errorMessage() ?? this._translate.instant("RS_INPUT_REQUIRED");
    }

    return null;
  }
}
