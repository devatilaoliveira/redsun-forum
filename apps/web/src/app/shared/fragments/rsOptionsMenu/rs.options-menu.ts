import {
  Component,
  ElementRef,
  HostListener,
  InputSignal,
  Signal,
  WritableSignal,
  computed,
  inject,
  input,
  output,
  OutputEmitterRef,
  signal
} from "@angular/core";
import {NgOptimizedImage} from "@angular/common";
import {EVariant} from "../../../../interface/enums/EVariant";
import {RsButtonText} from "../rsButtonText/rs.button-text";

export interface RsOptionsMenuOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: "rs-options-menu",
  standalone: true,
  imports: [NgOptimizedImage, RsButtonText],
  templateUrl: "./rs.options-menu.html",
  styleUrl: "./rs.options-menu.scss"
})
export class RsOptionsMenu {
  public readonly label: InputSignal<string> = input.required<string>();
  public readonly iconSrc: InputSignal<string | null> = input<string | null>(null);
  public readonly options: InputSignal<RsOptionsMenuOption[]> = input.required<RsOptionsMenuOption[]>();
  public readonly selectedValue: InputSignal<string | null> = input<string | null>(null);
  public readonly optionSelected: OutputEmitterRef<RsOptionsMenuOption> = output<RsOptionsMenuOption>();

  protected readonly isOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly EVariant = EVariant;
  protected readonly items: Signal<RsOptionsMenuOption[]> = computed<RsOptionsMenuOption[]>(() => {
    return this.options()
      .map((option) => ({
        ...option,
        label: option.label.trim()
      }))
      .filter((option) => option.value.trim().length > 0 && option.label.length > 0);
  });

  private readonly hostElementRef: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);

  protected toggle(): void {
    if (this.items().length === 0) return;
    this.isOpen.set(!this.isOpen());
  }

  protected selectOption(option: RsOptionsMenuOption): void {
    if (option.disabled) return;

    this.optionSelected.emit(option);
    this.isOpen.set(false);
  }

  protected optionRole(): "menuitem" | "menuitemradio" {
    return this.selectedValue() === null ? "menuitem" : "menuitemradio";
  }

  protected isSelected(option: RsOptionsMenuOption): boolean {
    return this.selectedValue() === option.value;
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
