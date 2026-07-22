import {Component, computed, DestroyRef, inject, OnInit, Signal, signal, WritableSignal} from "@angular/core";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ActivatedRoute} from "@angular/router";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {TranslatePipe} from "@ngx-translate/core";
import {finalize} from "rxjs";
import {IDevelopmentService, DevelopmentService} from "../../../services/development.service";
import {PostDTO} from "../../../interface/dtos/post/PostDTO";
import {EVariant} from "../../../interface/enums/EVariant";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {PostDetailsCardComponent} from "../../shared/ui/post-details-card/post-details-card.component";

@Component({
  selector: "rs-search-posts",
  standalone: true,
  imports: [ScrollingModule, TranslatePipe, RsButton, RsInput, RsSpinner, RsViewHeader, PostDetailsCardComponent],
  templateUrl: "./search-posts.view.html",
  styleUrl: "./search-posts.view.scss"
})
export class SearchPostsView implements OnInit {
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _developmentService: IDevelopmentService = inject(DevelopmentService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly taleId: WritableSignal<string | null> = signal(null);

  protected readonly posts: WritableSignal<PostDTO[]> = signal([]);
  protected readonly isLoading: WritableSignal<boolean> = signal(false);
  protected readonly hasSearched: WritableSignal<boolean> = signal(false);
  protected readonly loadFailed: WritableSignal<boolean> = signal(false);
  protected readonly characterNameFilter: WritableSignal<string> = signal("");
  protected readonly contentFilter: WritableSignal<string> = signal("");
  protected readonly searchDisabled: Signal<boolean> = computed(() => this.isLoading() || this.taleId() === null);
  protected readonly EVariant = EVariant;

  public ngOnInit(): void {
    this.taleId.set(this._activatedRoute.snapshot.paramMap.get("taleId"));
  }

  protected onSearch(): void {
    const taleId = this.taleId();
    if (!taleId || this.isLoading()) {
      return;
    }

    this.hasSearched.set(true);
    this.isLoading.set(true);
    this.loadFailed.set(false);

    this._developmentService.searchPosts(
      taleId,
      this.optionalFilter(this.characterNameFilter()),
      this.optionalFilter(this.contentFilter())
    ).pipe(
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe({
      next: (posts: PostDTO[]) => this.posts.set(posts),
      error: (error: unknown) => {
        this._printer.error("failed to load development post search", error);
        this.posts.set([]);
        this.loadFailed.set(true);
      }
    });
  }

  protected onCharacterNameFilterChange(value: string): void {
    this.characterNameFilter.set(value);
  }

  protected onContentFilterChange(value: string): void {
    this.contentFilter.set(value);
  }

  protected trackPostById(_index: number, post: PostDTO): string {
    return post.id;
  }

  private optionalFilter(value: string): string | undefined {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
}
