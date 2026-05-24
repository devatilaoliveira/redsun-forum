import {
  Component,
  ContentChild,
  OnDestroy,
  OnInit,
  TemplateRef,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from "@angular/core";
import {NgTemplateOutlet} from "@angular/common";
import {EVariant} from "../../../../interface/enums/EVariant";

@Component({
  selector: "rs-toast",
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: "./toast.component.html",
  styleUrl: "./toast.component.scss"
})
export class RsToastComponent implements OnInit, OnDestroy {
  public readonly label: InputSignal<string> = input.required<string>();
  public readonly variant: InputSignal<EVariant> = input<EVariant>(EVariant.PRIMARY);
  public readonly durationMs: InputSignal<number> = input<number>(4000);
  public readonly contentTemplate: InputSignal<TemplateRef<unknown> | null> = input<TemplateRef<unknown> | null>(null);

  public readonly dismissed: OutputEmitterRef<void> = output<void>();

  private dismissTimerId: ReturnType<typeof setTimeout> | null = null;
  private hasDismissed = false;

  protected readonly projectedTemplate: WritableSignal<TemplateRef<unknown> | null> = signal<TemplateRef<unknown> | null>(null);

  @ContentChild(TemplateRef)
  protected set projectedTemplateRef(template: TemplateRef<unknown> | null) {
    this.projectedTemplate.set(template);
  }

  protected readonly resolvedTemplate = computed<TemplateRef<unknown> | null>(() => {
    return this.contentTemplate() ?? this.projectedTemplate() ?? null;
  });

  protected readonly iconUrl = computed<string>(() => {
    switch (this.variant()) {
    case EVariant.DANGER:
      return "url('/assets/svgs/error.svg')";
    case EVariant.SUCCESS:
      return "url('/assets/svgs/done.svg')";
    case EVariant.WARNING:
      return "url('/assets/svgs/warning.svg')";
    default:
      return "url('/assets/svgs/warning.svg')";
    }
  });

  protected readonly role = computed<"alert" | "status">(() => {
    return this.variant() === EVariant.DANGER || this.variant() === EVariant.WARNING ? "alert" : "status";
  });

  protected readonly ariaLive = computed<"assertive" | "polite">(() => {
    return this.role() === "alert" ? "assertive" : "polite";
  });

  public ngOnInit(): void {
    this.scheduleAutoDismiss();
  }

  public ngOnDestroy(): void {
    this.clearAutoDismiss();
  }

  protected onClose(): void {
    this.dismiss();
  }

  private scheduleAutoDismiss(): void {
    const duration: number = this.durationMs();
    if (!Number.isFinite(duration) || duration <= 0) return;

    this.dismissTimerId = setTimeout(() => {
      this.dismiss();
    }, duration);
  }

  private clearAutoDismiss(): void {
    if (this.dismissTimerId === null) return;
    clearTimeout(this.dismissTimerId);
    this.dismissTimerId = null;
  }

  private dismiss(): void {
    if (this.hasDismissed) return;
    this.hasDismissed = true;
    this.clearAutoDismiss();
    this.dismissed.emit();
  }
}
