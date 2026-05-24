import {NgTemplateOutlet} from "@angular/common";
import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  TemplateRef,
  ViewChild,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from "@angular/core";
import {RsButton} from "../../fragments/rsButton/rs.button";
import {RsRoundIconButton} from "../../fragments/rsRoundIconButton/rs.round-icon-button";
import {EVariant} from "../../../../interface/enums/EVariant";

export interface RsDialogCta {
  label: string;
  variant?: EVariant;
  disabled?: boolean;
  inProgress?: boolean;
}

@Component({
  selector: "rs-dialog-modal",
  standalone: true,
  imports: [NgTemplateOutlet, RsButton, RsRoundIconButton],
  templateUrl: "./dialog-modal.component.html",
  styleUrl: "./dialog-modal.component.scss"
})
export class RsDialogModalComponent implements AfterViewInit {
  public readonly title: InputSignal<string> = input.required<string>();
  public readonly ctaBtnOne: InputSignal<RsDialogCta | null> = input<RsDialogCta | null>(null);
  public readonly ctaBtnTwo: InputSignal<RsDialogCta | null> = input<RsDialogCta | null>(null);
  public readonly contentTemplate: InputSignal<TemplateRef<unknown> | null> = input<TemplateRef<unknown> | null>(null);

  public readonly closePressed: OutputEmitterRef<void> = output<void>();
  public readonly ctaBtnOnePressed: OutputEmitterRef<void> = output<void>();
  public readonly ctaBtnTwoPressed: OutputEmitterRef<void> = output<void>();

  @ViewChild("panel", {static: true})
  private readonly panelRef?: ElementRef<HTMLElement>;

  protected readonly projectedTemplate: WritableSignal<TemplateRef<unknown> | null> = signal<TemplateRef<unknown> | null>(null);

  @ContentChild(TemplateRef)
  protected set projectedTemplateRef(template: TemplateRef<unknown> | null) {
    this.projectedTemplate.set(template);
  }

  protected readonly resolvedTemplate = computed<TemplateRef<unknown> | null>(() => {
    return this.contentTemplate() ?? this.projectedTemplate() ?? null;
  });

  protected readonly ctaOne = computed<RsDialogCta | null>(() => {
    return this.normalizeCta(this.ctaBtnOne(), EVariant.PRIMARY);
  });

  protected readonly ctaTwo = computed<RsDialogCta | null>(() => {
    return this.normalizeCta(this.ctaBtnTwo(), EVariant.SECONDARY);
  });

  protected readonly hasActions = computed<boolean>(() => {
    return !!this.ctaOne() || !!this.ctaTwo();
  });

  public ngAfterViewInit(): void {
    this.focusFirstElement();
  }

  protected onClose(): void {
    this.closePressed.emit();
  }

  protected onCtaOne(): void {
    this.ctaBtnOnePressed.emit();
  }

  protected onCtaTwo(): void {
    this.ctaBtnTwoPressed.emit();
  }

  protected onOverlayClick(event: MouseEvent): void {
    if (event.target !== event.currentTarget) return;
    this.onClose();
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== "Tab") return;
    this.trapFocus(event);
  }

  private normalizeCta(cta: RsDialogCta | null, fallbackVariant: EVariant): RsDialogCta | null {
    if (!cta) return null;
    const label = (cta.label ?? "").trim();
    if (label.length === 0) return null;

    return {
      label,
      variant: cta.variant ?? fallbackVariant,
      disabled: cta.disabled,
      inProgress: cta.inProgress
    };
  }


  private focusFirstElement(): void {
    const panel: HTMLElement | undefined = this.panelRef?.nativeElement;
    if (!panel) return;

    const focusable: HTMLElement[] = this.getFocusableElements(panel);
    if (focusable.length > 0) {
      focusable[0].focus();
      return;
    }

    panel.focus();
  }

  private trapFocus(event: KeyboardEvent): void {
    const panel: HTMLElement | undefined = this.panelRef?.nativeElement;
    if (!panel) return;

    const focusable: HTMLElement[] = this.getFocusableElements(panel);
    if (focusable.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const first: HTMLElement = focusable[0];
    const last: HTMLElement = focusable[focusable.length - 1];
    const active: Element | null = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const elements: NodeListOf<HTMLElement> = container.querySelectorAll(
      "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])"
    );

    return Array.from(elements).filter((element) => !element.hasAttribute("disabled"));
  }

  protected readonly EVariant = EVariant;
}
