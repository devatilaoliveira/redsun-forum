import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Signal,
  ViewChild,
  computed,
  effect,
  input,
  InputSignal,
  inject,
  signal,
  WritableSignal
} from "@angular/core";
import {RsSpinner} from "../../fragments/rsSpinner/rs.spinner";
import {TaleCardComponent} from "../tale-card/tale-card.component";
import {PageResponse} from "../../../../interface/dtos/general/PageResponse";
import {IPrinter, Printer} from "../../../../infra/miscellaneous/printer.handler";
import {finalize, Observable} from "rxjs";
import {EVariant} from "../../../../interface/enums/EVariant";
import {Router} from "@angular/router";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {TaleResponseDTO} from "../../../../interface/dtos/tale/TaleResponseDTO";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: "rs-tales-grid",
  standalone: true,
  imports: [RsSpinner, TaleCardComponent, TranslatePipe],
  templateUrl: "./tales-grid.component.html",
  styleUrl: "./tales-grid.component.scss"
})
export class TalesGridComponent implements OnInit, OnDestroy {
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _router: Router = inject(Router);
  private readonly loadMoreObserver: IntersectionObserver | null = typeof IntersectionObserver === "undefined"
    ? null
    : new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.tryLoadMore();
        }
      },
      {root: null, rootMargin: "0px 0px", threshold: 0}
    );

  private loadMoreTriggerElement: HTMLElement | null = null;

  public readonly title: InputSignal<string> = input.required<string>();
  public readonly emptyLabel: InputSignal<string> = input<string>("You have not created any tales yet.");
  public readonly loadPage: InputSignal<(page?: number) => Observable<PageResponse<TaleResponseDTO>>> =
    input.required<(page?: number) => Observable<PageResponse<TaleResponseDTO>>>();
  public readonly reloadToken: InputSignal<number> = input<number>(0);
  public readonly infiniteScroll: InputSignal<boolean> = input<boolean>(false);
  public readonly spinnerVariant: InputSignal<EVariant> = input<EVariant>(EVariant.PRIMARY);

  protected readonly talesPage: WritableSignal<PageResponse<TaleResponseDTO> | null> = signal<PageResponse<TaleResponseDTO> | null>(null);
  protected readonly loading: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly loadingMore: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly loadedCount: Signal<number> = computed(() => this.talesPage()?.content.length ?? 0);
  protected readonly totalCount: Signal<number> = computed(() => this.talesPage()?.page.totalElements ?? this.loadedCount());

  private initialized: boolean = false;

  @ViewChild("loadMoreTrigger")
  set loadMoreTrigger(element: ElementRef<HTMLElement> | undefined) {
    if (!element || !this.loadMoreObserver || element.nativeElement === this.loadMoreTriggerElement) {
      return;
    }

    if (this.loadMoreTriggerElement) {
      this.loadMoreObserver.unobserve(this.loadMoreTriggerElement);
    }

    this.loadMoreTriggerElement = element.nativeElement;
    this.loadMoreObserver.observe(element.nativeElement);
  }

  constructor() {
    effect(() => {
      this.reloadToken();
      if (this.initialized) {
        this.fetchTales(0, false);
      }
    });
  }

  ngOnInit(): void {
    this.initialized = true;
    this.fetchTales(0, false);
  }

  ngOnDestroy(): void {
    this.loadMoreObserver?.disconnect();
  }

  protected fetchTales(page: number = 0, append: boolean = false): void {
    if (append) {
      this.loadingMore.set(true);
    } else {
      this.loading.set(true);
    }

    this.loadPage()(page).pipe(
      finalize(() => {
        if (append) {
          this.loadingMore.set(false);
        } else {
          this.loading.set(false);
        }
      })
    ).subscribe({
      next: (pageData) => {
        const current = this.talesPage();
        const mergedContent = append && current
          ? [...current.content, ...pageData.content]
          : pageData.content;

        this.talesPage.set({
          ...pageData,
          page: {
            ...pageData.page,
            totalElements: append && pageData.content.length === 0
              ? mergedContent.length
              : pageData.page.totalElements
          },
          content: mergedContent
        });

        if (this.loadMoreObserver && this.loadMoreTriggerElement) {
          this.loadMoreObserver.unobserve(this.loadMoreTriggerElement);
          this.loadMoreObserver.observe(this.loadMoreTriggerElement);
        }
      },
      error: (err) => {
        this._printer.error("failed to load tales", err);
      }
    });
  }

  protected onTalePressed(taleId: string): void {
    if (!taleId) return;
    void this._router.navigate(["/", ROUTE_PATHS.tales, taleId]);
  }

  private tryLoadMore(): void {
    if (!this.infiniteScroll() || this.loading() || this.loadingMore()) {
      return;
    }

    const currentPage = this.talesPage();
    if (!currentPage) {
      return;
    }

    const loaded = currentPage.content.length;
    const total = currentPage.page.totalElements;
    if (loaded >= total) {
      return;
    }

    this.fetchTales(currentPage.page.number + 1, true);
  }
}
