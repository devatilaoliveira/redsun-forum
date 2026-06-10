import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  input,
  InputSignal,
  OnDestroy,
  signal,
  ViewChild,
  WritableSignal
} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";
import {RsButtonText} from "../rsButtonText/rs.button-text";

@Component({
  selector: "rs-expandable-text",
  standalone: true,
  imports: [RsButtonText, TranslatePipe],
  templateUrl: "./rs.expandable-text.html",
  styleUrl: "./rs.expandable-text.scss"
})
export class RsExpandableText implements AfterViewInit, OnDestroy {
  public readonly text: InputSignal<string> = input.required<string>();
  public readonly maxLines: InputSignal<number> = input<number>(6);

  @ViewChild("content", {static: true})
  private readonly contentRef?: ElementRef<HTMLParagraphElement>;

  protected readonly expanded: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly canToggle: WritableSignal<boolean> = signal<boolean>(false);

  private readonly viewReady: WritableSignal<boolean> = signal<boolean>(false);
  private resizeObserver: ResizeObserver | null = null;
  private measureFrame: number | null = null;

  constructor() {
    effect(() => {
      this.text();
      this.maxLines();

      if (!this.viewReady()) return;

      this.expanded.set(false);
      this.scheduleMeasure();
    });
  }

  public ngAfterViewInit(): void {
    this.viewReady.set(true);
    this.observeContentResize();
    this.scheduleMeasure();
  }

  public ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.measureFrame !== null) {
      cancelAnimationFrame(this.measureFrame);
    }
  }

  protected toggleExpanded(): void {
    this.expanded.update((expanded: boolean) => !expanded);
    this.scheduleMeasure();
  }

  private observeContentResize(): void {
    const content: HTMLParagraphElement | undefined = this.contentRef?.nativeElement;
    if (!content || typeof ResizeObserver === "undefined") return;

    this.resizeObserver = new ResizeObserver(() => this.scheduleMeasure());
    this.resizeObserver.observe(content);
  }

  private scheduleMeasure(): void {
    if (this.measureFrame !== null) {
      cancelAnimationFrame(this.measureFrame);
    }

    this.measureFrame = requestAnimationFrame(() => {
      this.measureFrame = null;
      this.measureOverflow();
    });
  }

  private measureOverflow(): void {
    const content: HTMLParagraphElement | undefined = this.contentRef?.nativeElement;
    if (!content) return;

    const lineHeight: number = this.getLineHeight(content);
    const maxHeight: number = lineHeight * this.maxLines();
    const contentHeight: number = content.scrollHeight;

    this.canToggle.set(contentHeight > maxHeight + 1);
  }

  private getLineHeight(element: HTMLElement): number {
    const style: CSSStyleDeclaration = getComputedStyle(element);
    const lineHeight: number = Number.parseFloat(style.lineHeight);
    if (Number.isFinite(lineHeight)) return lineHeight;

    const fontSize: number = Number.parseFloat(style.fontSize);
    return Number.isFinite(fontSize) ? fontSize * 1.2 : 16 * 1.2;
  }
}
