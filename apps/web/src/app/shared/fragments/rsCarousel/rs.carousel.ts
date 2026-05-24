import {NgTemplateOutlet} from "@angular/common";
import {
  AfterViewInit,
  Component,
  ContentChild,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
  ElementRef,
  input,
  InputSignal,
  OnDestroy,
  signal,
  TemplateRef,
  ViewChild,
  WritableSignal
} from "@angular/core";
import {SwipeSlide} from "../../../../interface/models/swipe-slide";

type SwiperElement = HTMLElement & {
  initialize?: () => void;
  swiper?: {
    update?: () => void;
    destroy?: (deleteInstance?: boolean, cleanStyles?: boolean) => void;
  };
};

@Component({
  selector: "rs-carousel",
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: "./rs.carousel.html",
  styleUrl: "./rs.carousel.scss",
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RsCarousel implements AfterViewInit, OnDestroy {
  public readonly title: InputSignal<string | null> = input<string | null>(null);
  public readonly slides: InputSignal<readonly SwipeSlide[]> = input<readonly SwipeSlide[]>([]);
  public readonly slidesPerView: InputSignal<number | "auto"> = input<number | "auto">("auto");
  public readonly slidesPerGroup: InputSignal<number> = input<number>(1);
  public readonly spaceBetween: InputSignal<number> = input<number>(12);

  @ContentChild(TemplateRef) protected readonly slideTemplate?: TemplateRef<{ $implicit: SwipeSlide }>;

  @ViewChild("swiperContainer", {static: true})
  private readonly swiperContainer?: ElementRef<SwiperElement>;

  private readonly viewReady: WritableSignal<boolean> = signal(false);

  constructor() {
    effect(() => {
      this.slides();
      if (!this.viewReady()) return;
      queueMicrotask(() => this.updateSwiper());
    });
  }

  public ngAfterViewInit(): void {
    this.viewReady.set(true);
    this.updateSwiper();
  }

  public ngOnDestroy(): void {
    this.swiperContainer?.nativeElement?.swiper?.destroy?.(true, true);
  }

  private updateSwiper(): void {
    const element: SwiperElement | undefined = this.swiperContainer?.nativeElement;
    if (!element) return;

    if (this.slides().length === 0) {
      element.swiper?.destroy?.(true, true);
      return;
    }

    if (!element.swiper && element.initialize) {
      element.initialize();
      return;
    }

    element.swiper?.update?.();
  }
}
