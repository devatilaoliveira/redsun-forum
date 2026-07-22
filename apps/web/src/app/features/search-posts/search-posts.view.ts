import {Component, computed, DestroyRef, inject, OnInit, Signal, signal, WritableSignal} from "@angular/core";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ActivatedRoute} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {catchError, debounceTime, distinctUntilChanged, filter, finalize, map, merge, of, Subject, switchMap} from "rxjs";
import {IDevelopmentService, DevelopmentService} from "../../../services/development.service";
import {PostDTO} from "../../../interface/dtos/post/PostDTO";
import {EVariant} from "../../../interface/enums/EVariant";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {PostDetailsCardComponent} from "../../shared/ui/post-details-card/post-details-card.component";

@Component({
  selector: "rs-search-posts",
  standalone: true,
  imports: [TranslatePipe, RsInput, RsSpinner, RsViewHeader, PostDetailsCardComponent],
  templateUrl: "./search-posts.view.html",
  styleUrl: "./search-posts.view.scss"
})
export class SearchPostsView implements OnInit {
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _developmentService: IDevelopmentService = inject(DevelopmentService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly filterChanges = new Subject<SearchPostFilters>();

  protected readonly posts: WritableSignal<PostDTO[]> = signal([]);
  protected readonly isLoading: WritableSignal<boolean> = signal(true);
  protected readonly filtersPending: WritableSignal<boolean> = signal(false);
  protected readonly loadFailed: WritableSignal<boolean> = signal(false);
  protected readonly characterNameFilter: WritableSignal<string> = signal("");
  protected readonly contentFilter: WritableSignal<string> = signal("");
  protected readonly filtersReady: Signal<boolean> = computed(() => (
    this.isValidFilter(this.characterNameFilter()) && this.isValidFilter(this.contentFilter())
  ));
  protected readonly EVariant = EVariant;

  public ngOnInit(): void {
    const taleId = this._activatedRoute.snapshot.paramMap.get("taleId");
    if (!taleId) {
      this.loadFailed.set(true);
      this.isLoading.set(false);
      return;
    }

    const initialFilters: SearchPostFilters = {characterName: "", content: ""};
    merge(
      of(initialFilters),
      this.filterChanges.pipe(
        debounceTime(300),
        distinctUntilChanged((previous, current) => (
          previous.characterName === current.characterName && previous.content === current.content
        )),
        filter((filters: SearchPostFilters) => (
          this.isValidFilter(filters.characterName) && this.isValidFilter(filters.content)
        ))
      )
    ).pipe(
      switchMap((filters: SearchPostFilters) => {
        this.isLoading.set(true);
        this.loadFailed.set(false);
        return this._developmentService.searchPosts(
          taleId,
          this.optionalFilter(filters.characterName),
          this.optionalFilter(filters.content)
        ).pipe(
          map((posts: PostDTO[]) => ({filters, posts})),
          catchError((error: unknown) => {
            this._printer.error("failed to load development post search", error);
            return of({filters, posts: null});
          }),
          finalize(() => this.isLoading.set(false))
        );
      }),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe((result: SearchPostResult) => {
      if (!this.isCurrentFilters(result.filters)) {
        return;
      }

      this.filtersPending.set(false);
      if (result.posts === null) {
        this.posts.set([]);
        this.loadFailed.set(true);
        return;
      }
      this.posts.set(result.posts);
    });
  }

  protected onCharacterNameFilterChange(value: string): void {
    this.characterNameFilter.set(value);
    this.filtersPending.set(true);
    this.emitFilters();
  }

  protected onContentFilterChange(value: string): void {
    this.contentFilter.set(value);
    this.filtersPending.set(true);
    this.emitFilters();
  }

  private emitFilters(): void {
    this.filterChanges.next({
      characterName: this.characterNameFilter(),
      content: this.contentFilter()
    });
  }

  private isValidFilter(value: string): boolean {
    const length = value.trim().length;
    return length === 0 || length >= 3;
  }

  private optionalFilter(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private isCurrentFilters(filters: SearchPostFilters): boolean {
    return filters.characterName === this.characterNameFilter()
      && filters.content === this.contentFilter();
  }
}

interface SearchPostFilters {
  characterName: string;
  content: string;
}

interface SearchPostResult {
  filters: SearchPostFilters;
  posts: PostDTO[] | null;
}
