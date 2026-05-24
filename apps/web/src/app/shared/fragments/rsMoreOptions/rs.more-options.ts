import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal
} from "@angular/core";
import {EAction} from "../../../../interface/enums/EAction";
import {RsRoundIconButton} from "../rsRoundIconButton/rs.round-icon-button";

export interface RsMoreOption {
  text: string;
  action: EAction;
}

@Component({
  selector: "rs-more-options",
  standalone: true,
  imports: [RsRoundIconButton],
  templateUrl: "./rs.more-options.html",
  styleUrl: "./rs.more-options.scss"
})
export class RsMoreOptions {
  public readonly options: InputSignal<RsMoreOption[]> = input.required<RsMoreOption[]>();
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly actionSelected: OutputEmitterRef<RsMoreOption> = output<RsMoreOption>();

  protected readonly isOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly items: Signal<RsMoreOption[]> = computed<RsMoreOption[]>(() => {
    return this.options()
      .map((option) => ({
        ...option,
        text: option.text.trim()
      }))
      .filter((option) => option.text.length > 0);
  });

  private readonly hostElementRef: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);

  protected toggle(): void {
    if (this.disabled()) return;
    if (this.items().length === 0) return;
    this.isOpen.set(!this.isOpen());
  }

  protected selectOption(option: RsMoreOption): void {
    if (this.disabled()) return;
    this.actionSelected.emit(option);
    this.isOpen.set(false);
  }

  @HostListener("click", ["$event"])
  protected onHostClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  @HostListener("document:click", ["$event"])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target: Node | null = event.target as Node | null;
    if (target && this.hostElementRef.nativeElement.contains(target)) return;
    this.isOpen.set(false);
  }

  @HostListener("document:keydown.escape")
  protected onEscape(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
  }
}
