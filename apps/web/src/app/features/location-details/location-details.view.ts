import {Component, computed, ElementRef, inject, OnDestroy, OnInit, Signal, signal, ViewChild, WritableSignal} from "@angular/core";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {toSignal} from "@angular/core/rxjs-interop";
import {finalize, map} from "rxjs";
import {LocationDetailsDTO} from "../../../interface/dtos/location/LocationDetailsDTO";
import {PostDTO} from "../../../interface/dtos/post/PostDTO";
import {EAction} from "../../../interface/enums/EAction";
import {EPostStatus} from "../../../interface/enums/EPostStatus";
import {EPostType} from "../../../interface/enums/EPostType";
import {EVariant} from "../../../interface/enums/EVariant";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {ILocationService, LocationService} from "../../../services/location.service";
import {IPostService, PostService} from "../../../services/post.service";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";
import {RsTextarea} from "../../shared/fragments/rsTextarea/rs.textarea";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {LocalDetailsCardComponent} from "../../shared/ui/local-details-card/local-details-card.component";
import {LocalStoreService} from "../../../services/local-store.service";
import {MeResponseDTO} from "../../../interface/dtos/user/MeResponseDTO";
import {RsAvatar} from "../../shared/fragments/rsAvatar/rs.avatar";
import {UTIL_CONSTANTS} from "../../../interface/constants/util.constants";
import {RsDiceInput, RsDiceListValue} from "../../shared/fragments/rsDiceInput/rs.dice-input";
import {RsRedsunDiceInput, RsRedsunDiceListValue} from "../../shared/fragments/rsRedsunDiceInput/rs.redsun-dice-input";
import {RsRoundIconButton} from "../../shared/fragments/rsRoundIconButton/rs.round-icon-button";
import {RsMoreOption} from "../../shared/fragments/rsMoreOptions/rs.more-options";
import {RsDialogModalComponent} from "../../shared/ui/dialog-modal/dialog-modal.component";
import {PostDetailsCardComponent} from "../../shared/ui/post-details-card/post-details-card.component";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {TaleParticipantProfileDTO} from "../../../interface/dtos/tale/TaleParticipantProfileDTO";
import {TalesContextService} from "../../../stateServices/tales-context.service";
import {RsTooltip} from "../../shared/fragments/rsTooltip/rs.tooltip";
import {ERuleSystem} from "../../../interface/enums/ERuleSystem";
import {ESubscriptionPlan} from "../../../interface/enums/ESubscriptionPlan";
import {IToastService, ToastService} from "../../../services/toast.service";
import {CharacterSheetService, ICharacterSheetService} from "../../../services/character-sheet.service";
import {
  CharacterSheetResponseDTO
} from "../../../interface/dtos/characterSheet/CharacterSheetDTO";
import {RedSunSheetResponseDTO} from "../../../interface/dtos/characterSheet/RedSunSheetResponseDTO";
import {CompactRedSunSheetComponent} from "./compact-redsun-sheet/compact-redsun-sheet.component";

type PostFormGroup = FormGroup<{
  content: FormControl<string>;
}>;

const POST_INPUT_MODE = {
  post: "post",
  dice: "dice",
  redsunDice: "redsunDice",
  characterSheet: "characterSheet",
} as const;

type PostInputMode = typeof POST_INPUT_MODE[keyof typeof POST_INPUT_MODE];

type LocationDetailsViewModel = LocationDetailsDTO & {
  posts: PostDTO[];
};

interface PostOptionLabels {
  cancel: string;
  delete: string;
}

interface VisiblePostViewModel {
  post: PostDTO;
  options: RsMoreOption[];
}

@Component({
  selector: "rs-location-details",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    RsButton,
    RsSpinner,
    RsTextarea,
    RsViewHeader,
    LocalDetailsCardComponent,
    RsAvatar,
    RsDiceInput,
    RsRedsunDiceInput,
    RsRoundIconButton,
    RsTooltip,
    RsDialogModalComponent,
    PostDetailsCardComponent,
    CompactRedSunSheetComponent
  ],
  templateUrl: "./location-details.view.html",
  styleUrl: "./location-details.view.scss"
})
export class LocationDetailsView implements OnInit, OnDestroy {
  @ViewChild(RsDiceInput)
  private diceInput?: RsDiceInput;
  @ViewChild(RsRedsunDiceInput)
  private redsunDiceInput?: RsRedsunDiceInput;
  private readonly loadMoreObserver: IntersectionObserver | null = typeof IntersectionObserver === "undefined"
    ? null
    : new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.tryLoadMorePosts();
        }
      },
      {root: null, rootMargin: "0px 0px", threshold: 0}
    );

  private hasObservedTrigger = false;
  private loadMoreTriggerElement: HTMLElement | null = null;
  private readonly _formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly _locationService: ILocationService = inject(LocationService);
  private readonly _postService: IPostService = inject(PostService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _LocalStoreService: LocalStoreService = inject(LocalStoreService);
  private readonly _talesContext: TalesContextService = inject(TalesContextService);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _toastService: IToastService = inject(ToastService);
  private readonly _characterSheetService: ICharacterSheetService = inject(CharacterSheetService);

  protected user: Signal<MeResponseDTO | null> = this._LocalStoreService.user;
  protected readonly currentUserId: Signal<string | null> = computed(() => this.user()?.id ?? null);
  protected readonly POST_INPUT_MODE = POST_INPUT_MODE;
  protected readonly EVariant = EVariant;
  protected readonly locationId: string | null = this._activatedRoute.snapshot.paramMap.get(ROUTE_PATHS.locationId);
  protected readonly postInProgress: WritableSignal<boolean> = signal(false);
  protected readonly improvePostInProgress: WritableSignal<boolean> = signal(false);
  protected readonly isLoading: WritableSignal<boolean> = signal(false);
  protected readonly isLoadingPosts: WritableSignal<boolean> = signal(false);
  protected readonly isLoadingMore: WritableSignal<boolean> = signal(false);
  protected readonly characterSheetLoading: WritableSignal<boolean> = signal(false);
  protected readonly characterSheetLoadFailed: WritableSignal<boolean> = signal(false);
  protected readonly locationDetails: WritableSignal<LocationDetailsViewModel | null> = signal(null);
  protected readonly characterSheet: WritableSignal<RedSunSheetResponseDTO | null> = signal<RedSunSheetResponseDTO | null>(null);
  protected readonly postContent: WritableSignal<string> = signal("");
  protected readonly diceValues: WritableSignal<RsDiceListValue> = signal<RsDiceListValue>([]);
  protected readonly redsunDiceValues: WritableSignal<RsRedsunDiceListValue> = signal<RsRedsunDiceListValue>([]);
  protected readonly postInputMode: WritableSignal<PostInputMode> = signal<PostInputMode>(POST_INPUT_MODE.post);
  protected readonly totalPosts: WritableSignal<number | null> = signal<number | null>(null);
  protected readonly nextPage: WritableSignal<number> = signal(0);
  protected readonly isCurrentUserTaleOwner: Signal<boolean> = computed(() => {
    const currentUser = this.user();
    const location = this.locationDetails();
    return currentUser != null && location?.taleOwnerId != null && currentUser.id === location.taleOwnerId;
  });
  protected readonly hasDiceCount: Signal<boolean> = computed(() => (
    this.diceValues().some((value) => value.diceCount > 0)
  ));
  protected readonly hasRedsunDiceRoll: Signal<boolean> = computed(() => (
    this.redsunDiceValues().some((value) => value.diceCount > 0 && value.difficulty > 0)
  ));
  protected readonly isRedsunTale: Signal<boolean> = computed(() => (
    this._talesContext.tale()?.rules === ERuleSystem.REDSUN
  ));
  protected readonly canUseCharacterSheetInput: Signal<boolean> = computed(() => (
    this.isRedsunTale() && !this.isCurrentUserTaleOwner()
  ));
  protected readonly isPremium: Signal<boolean> = computed(() => (
    this.user()?.subscription?.plan === ESubscriptionPlan.PREMIUM
    || this.user()?.subscription?.plan === ESubscriptionPlan.MAX
  ));
  protected readonly showDiceInput: Signal<boolean> = computed(() => this.postInputMode() === POST_INPUT_MODE.dice);
  protected readonly showRedsunDiceInput: Signal<boolean> = computed(() => this.postInputMode() === POST_INPUT_MODE.redsunDice);
  protected readonly showCharacterSheetInput: Signal<boolean> = computed(() => (
    this.postInputMode() === POST_INPUT_MODE.characterSheet && this.canUseCharacterSheetInput()
  ));
  protected readonly isDiceInputMode: Signal<boolean> = computed(() =>
    this.postInputMode() === POST_INPUT_MODE.dice || this.postInputMode() === POST_INPUT_MODE.redsunDice
  );
  protected readonly canImprovePostText: Signal<boolean> = computed(() =>
    this.postInputMode() === POST_INPUT_MODE.post && this.postContent().trim().length > 0
  );
  protected readonly canSubmitCurrentInput: Signal<boolean> = computed(() => {
    switch (this.postInputMode()) {
    case POST_INPUT_MODE.dice:
      return this.hasDiceCount();
    case POST_INPUT_MODE.redsunDice:
      return this.hasRedsunDiceRoll();
    case POST_INPUT_MODE.characterSheet:
      return false;
    case POST_INPUT_MODE.post:
    default:
      return this.postContent().trim().length > 0 && this.postFormGroup.valid;
    }
  });
  private readonly visiblePosts: Signal<PostDTO[]> = computed(() => {
    const location = this.locationDetails();
    if (!location) return [];
    if (this.isCurrentUserTaleOwner()) {
      return location.posts;
    }
    return location.posts.filter((post) => post.status !== EPostStatus.INACTIVE);
  });
  private readonly postOptionLabels: Signal<PostOptionLabels> = toSignal(
    this._translateService.onLangChange.pipe(
      map(() => this.getPostOptionLabels())
    ),
    {initialValue: this.getPostOptionLabels()}
  );
  protected readonly visiblePostViewModels: Signal<VisiblePostViewModel[]> = computed(() => {
    const labels = this.postOptionLabels();
    const isTaleOwner = this.isCurrentUserTaleOwner();
    const currentUserId = this.currentUserId();

    return this.visiblePosts().map((post) => {
      const canCancel = this.canDeactivatePostForUser(post, currentUserId, isTaleOwner);
      return {
        post,
        options: this.buildPostOptions(canCancel, isTaleOwner, labels.cancel, labels.delete)
      };
    });
  });
  protected readonly confirmDeactivateOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly pendingDeactivatePost: WritableSignal<PostDTO | null> = signal<PostDTO | null>(null);
  protected readonly confirmDeleteOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly pendingDeletePost: WritableSignal<PostDTO | null> = signal<PostDTO | null>(null);
  protected readonly loadedPostsCount: Signal<number> = computed(() => this.locationDetails()?.posts.length ?? 0);
  protected readonly totalPostsCount: Signal<number> = computed(() => this.totalPosts() ?? this.loadedPostsCount());
  protected readonly currentTaleParticipant: Signal<TaleParticipantProfileDTO | null> = computed(() => {
    const currentUser = this.user();
    if (!currentUser) {
      return null;
    }

    return this._talesContext.participants().find((participant) => participant.id === currentUser.id) ?? null;
  });

  private readonly pageSize = 10;

  @ViewChild("loadMoreTrigger")
  set loadMoreTrigger(element: ElementRef<HTMLElement> | undefined) {
    if (!element || !this.loadMoreObserver || this.hasObservedTrigger) {
      return;
    }

    this.loadMoreTriggerElement = element.nativeElement;
    this.loadMoreObserver.observe(element.nativeElement);
    this.hasObservedTrigger = true;
  }

  protected readonly postFormGroup: PostFormGroup = this._formBuilder.group({
    content: this._formBuilder.control<string>("", {validators: [Validators.required, Validators.maxLength(UTIL_CONSTANTS.LONG_TEXT_LENGTH)]})
  });
  protected readonly postControls: { content: FormControl<string> } = this.postFormGroup.controls;

  public ngOnInit(): void {
    if (this.locationId != null) {
      this.isLoading.set(true);
      this._locationService.getLocationDetails(this.locationId).pipe(
        finalize(() => this.isLoading.set(false))
      ).subscribe({
        next: (response) => {
          this.locationDetails.set({...response, posts: []});
          this.resetPostPagination();
          this.fetchPosts(this.locationId!, 0, false);
        },
        error: (err) => {
          this._printer.error("failed to load location details", err);
        }
      });
    }
  }

  public ngOnDestroy(): void {
    this.loadMoreObserver?.disconnect();
  }

  protected onPostContentChange(value: string): void {
    this.setPostContent(value);
  }

  protected onShowPostInput(): void {
    if (this.postInputMode() === POST_INPUT_MODE.post) return;
    this.postInputMode.set(POST_INPUT_MODE.post);
    this.resetDiceInputs();
  }

  protected onShowDiceInput(): void {
    if (this.postInputMode() === POST_INPUT_MODE.dice) return;
    this.postInputMode.set(POST_INPUT_MODE.dice);
    this.resetRedsunDiceInput();
    this.resetPostContent();
  }

  protected onShowRedsunDiceInput(): void {
    if (!this.isRedsunTale() || this.postInputMode() === POST_INPUT_MODE.redsunDice) return;
    this.postInputMode.set(POST_INPUT_MODE.redsunDice);
    this.resetDiceInput();
    this.resetPostContent();
  }

  protected onShowCharacterSheetInput(): void {
    if (!this.canUseCharacterSheetInput() || this.postInputMode() === POST_INPUT_MODE.characterSheet) return;
    this.postInputMode.set(POST_INPUT_MODE.characterSheet);
    this.loadCharacterSheetIfNeeded();
  }

  protected onSubmitPost(locationId: string): void {
    this.postFormGroup.markAllAsTouched();

    if (this.showDiceInput() && this.hasDiceCount()) {
      const diceContent: string = this.diceInput?.buildPostContent(this.diceValues()) ?? "";
      this.postControls.content.setValue(diceContent);
      this.postControls.content.markAsDirty();
    }

    if (this.showRedsunDiceInput() && this.hasRedsunDiceRoll()) {
      const diceContent: string = this.redsunDiceInput?.buildPostContent(this.redsunDiceValues()) ?? "";
      this.postControls.content.setValue(diceContent);
      this.postControls.content.markAsDirty();
    }

    if (this.postFormGroup.invalid || this.postInProgress()) {
      return;
    }

    const content: string = this.postControls.content.value.trim();
    if (!content) {
      return;
    }

    this.postInProgress.set(true);

    this._postService.createPost({locationId, content, type: this.currentPostType()}).pipe(
      finalize(() => {
        this.postInProgress.set(false);
        this.postFormGroup.reset({content: ""});
        this.postContent.set("");
        if (this.isDiceInputMode()) {
          this.resetDiceInputs();
          this.diceInput?.resetFields();
          this.redsunDiceInput?.resetFields();
        }
      })
    ).subscribe({
      next: (newPost) => {
        this.locationDetails.update(locationDetailsResponse => {
          if (!locationDetailsResponse) return locationDetailsResponse;
          return {...locationDetailsResponse, posts: [newPost, ...locationDetailsResponse.posts]};
        });
        this.totalPosts.update((total) => (total == null ? total : total + 1));
      },
      error: (err) => {
        this._printer.error("failed to create post", err);
      }
    });
  }

  protected onDiceValueChange(values: RsDiceListValue): void {
    this.diceValues.set(values);
  }

  protected onRedsunDiceValueChange(values: RsRedsunDiceListValue): void {
    this.redsunDiceValues.set(values);
  }

  private currentPostType(): EPostType {
    switch (this.postInputMode()) {
    case POST_INPUT_MODE.dice:
      return EPostType.GENERALDICEROLL;
    case POST_INPUT_MODE.redsunDice:
      return EPostType.RSDICEROLL;
    case POST_INPUT_MODE.characterSheet:
      return EPostType.TEXT;
    case POST_INPUT_MODE.post:
    default:
      return EPostType.TEXT;
    }
  }

  private canDeactivatePost(post: PostDTO): boolean {
    return this.canDeactivatePostForUser(post, this.currentUserId(), this.isCurrentUserTaleOwner());
  }

  private buildPostOptions(canCancel: boolean, canDelete: boolean, cancelLabel: string, deleteLabel: string): RsMoreOption[] {
    const options: RsMoreOption[] = [];
    if (canCancel) {
      options.push({text: cancelLabel, action: EAction.CANCEL});
    }
    if (canDelete) {
      options.push({text: deleteLabel, action: EAction.DELETE});
    }
    return options;
  }

  protected onPostOptionSelected(post: PostDTO, option: RsMoreOption): void {
    if (!post?.id) return;

    switch (option.action) {
    case EAction.CANCEL:
      if (!this.canDeactivatePost(post)) return;
      if (this.isCurrentUserTaleOwner()) {
        this.deactivatePost(post.id);
        return;
      }
      this.openDeactivateConfirm(post);
      break;
    case EAction.DELETE:
      if (!this.isCurrentUserTaleOwner()) return;
      this.openDeleteConfirm(post);
      break;
    default:
      break;
    }
  }

  private deletePost(postId: string): void {
    this._postService.deletePost(postId).subscribe({
      next: () => {
        this.removePostFromList(postId);
        this.totalPosts.update((total) => (total == null ? total : Math.max(total - 1, 0)));
      },
      error: (err) => {
        this._printer.error("failed to delete post", err);
      }
    });
  }

  private deactivatePost(postId: string): void {
    this._postService.deactivatePost(postId).subscribe({
      next: () => {
        this.updatePostStatus(postId, EPostStatus.INACTIVE);
      },
      error: (err) => {
        this._printer.error("failed to deactivate post", err);
      }
    });
  }

  protected readonly UTIL_CONSTANTS = UTIL_CONSTANTS;

  protected openDeactivateConfirm(post: PostDTO): void {
    if (!post?.id) return;
    this.pendingDeactivatePost.set(post);
    this.confirmDeactivateOpen.set(true);
  }

  protected closeDeactivateConfirm(): void {
    this.confirmDeactivateOpen.set(false);
    this.pendingDeactivatePost.set(null);
  }

  protected confirmDeactivatePost(): void {
    const post = this.pendingDeactivatePost();
    if (!post?.id) return;
    this.deactivatePost(post.id);
    this.closeDeactivateConfirm();
  }

  protected openDeleteConfirm(post: PostDTO): void {
    if (!post?.id) return;
    this.pendingDeletePost.set(post);
    this.confirmDeleteOpen.set(true);
  }

  protected closeDeleteConfirm(): void {
    this.confirmDeleteOpen.set(false);
    this.pendingDeletePost.set(null);
  }

  protected confirmDeletePost(): void {
    const post = this.pendingDeletePost();
    if (!post?.id) return;
    this.deletePost(post.id);
    this.closeDeleteConfirm();
  }

  private removePostFromList(postId: string): void {
    this.locationDetails.update((locationDetailsResponse) => {
      if (!locationDetailsResponse) {
        return locationDetailsResponse;
      }

      const posts = locationDetailsResponse.posts.filter((post) => post.id !== postId);
      return {...locationDetailsResponse, posts};
    });
  }

  private updatePostStatus(postId: string, status: EPostStatus): void {
    this.locationDetails.update((locationDetailsResponse) => {
      if (!locationDetailsResponse) {
        return locationDetailsResponse;
      }

      const posts = locationDetailsResponse.posts.map((post) => (
        post.id === postId ? {...post, status} : post
      ));
      return {...locationDetailsResponse, posts};
    });
  }

  private tryLoadMorePosts(): void {
    if (!this.locationId || this.isLoadingPosts() || this.isLoadingMore()) {
      return;
    }

    const total = this.totalPosts();
    const loaded = this.locationDetails()?.posts.length ?? 0;
    if (total != null && loaded >= total) {
      return;
    }

    this.fetchPosts(this.locationId, this.nextPage(), true);
  }

  private fetchPosts(locationId: string, page: number, append: boolean): void {
    if (append) {
      this.isLoadingMore.set(true);
    } else {
      this.isLoadingPosts.set(true);
    }

    this._postService.listPostsForLocation(locationId, page, this.pageSize).pipe(
      finalize(() => {
        if (append) {
          this.isLoadingMore.set(false);
        } else {
          this.isLoadingPosts.set(false);
        }
      })
    ).subscribe({
      next: (pageData) => {
        let mergedLength = pageData.content.length;
        this.locationDetails.update((locationDetailsResponse) => {
          if (!locationDetailsResponse) {
            return locationDetailsResponse;
          }

          const existingIds = new Set(locationDetailsResponse.posts.map((post) => post.id));
          const appended = append
            ? pageData.content.filter((post) => !existingIds.has(post.id))
            : pageData.content;
          const merged = append ? [...locationDetailsResponse.posts, ...appended] : appended;
          mergedLength = merged.length;
          return {...locationDetailsResponse, posts: merged};
        });

        this.totalPosts.set(pageData.page.totalElements);
        this.nextPage.set(pageData.page.number + 1);

        if (append && pageData.content.length === 0) {
          this.totalPosts.set(mergedLength);
        }

        if (this.loadMoreObserver && this.loadMoreTriggerElement) {
          this.loadMoreObserver.unobserve(this.loadMoreTriggerElement);
          this.loadMoreObserver.observe(this.loadMoreTriggerElement);
        }
      },
      error: (err) => {
        this._printer.error("failed to load posts", err);
      }
    });
  }

  private resetPostPagination(): void {
    this.totalPosts.set(null);
    this.nextPage.set(0);
  }

  private resetPostContent(): void {
    this.postControls.content.setValue("");
    this.postContent.set("");
    this.postControls.content.markAsPristine();
    this.postControls.content.markAsUntouched();
  }

  private resetDiceInput(): void {
    this.diceValues.set([]);
  }

  private resetRedsunDiceInput(): void {
    this.redsunDiceValues.set([]);
  }

  private resetDiceInputs(): void {
    this.resetDiceInput();
    this.resetRedsunDiceInput();
  }

  private canDeactivatePostForUser(post: PostDTO, currentUserId: string | null, isTaleOwner: boolean): boolean {
    const isPostAuthor = currentUserId != null && post.author.id != null && currentUserId === post.author.id;
    return post.status !== EPostStatus.INACTIVE && (isPostAuthor || isTaleOwner);
  }

  private getPostOptionLabels(): PostOptionLabels {
    return {
      cancel: this._translateService.instant("CANCEL_ACTION"),
      delete: this._translateService.instant("DELETE")
    };
  }

  private loadCharacterSheetIfNeeded(): void {
    if (!this.canUseCharacterSheetInput()) {
      return;
    }

    if (this.characterSheet() || this.characterSheetLoading()) {
      return;
    }

    const taleId = this._talesContext.taleId();
    const currentUserId = this.currentUserId();
    if (!taleId || !currentUserId) {
      this.characterSheetLoadFailed.set(true);
      return;
    }

    this.characterSheetLoading.set(true);
    this.characterSheetLoadFailed.set(false);
    this._characterSheetService.getCharacterSheet(taleId, currentUserId).pipe(
      finalize(() => this.characterSheetLoading.set(false))
    ).subscribe({
      next: (response: CharacterSheetResponseDTO) => {
        if (response.ruleSystem !== ERuleSystem.REDSUN) {
          this.characterSheet.set(null);
          this.characterSheetLoadFailed.set(true);
          return;
        }

        this.characterSheet.set(response.sheet as RedSunSheetResponseDTO);
      },
      error: (err: unknown) => {
        this._printer.error("failed to load compact character sheet", err);
        this.characterSheet.set(null);
        this.characterSheetLoadFailed.set(true);
      }
    });
  }

  protected improvePostTextWithAI(): void {
    if (this.postInputMode() !== POST_INPUT_MODE.post || this.postInProgress() || this.improvePostInProgress()) {
      return;
    }

    const originalContent: string = this.postControls.content.value;
    const content: string = originalContent.trim();
    if (!content) {
      return;
    }

    this.improvePostInProgress.set(true);

    this._postService.improvePostTextWithAI(content).pipe(
      finalize(() => this.improvePostInProgress.set(false))
    ).subscribe({
      next: (response) => {
        this.setPostContent(response.content);
      },
      error: (err) => {
        this.setPostContent(originalContent);
        this._printer.error("failed to improve post text with AI", err);
        this._toastService.show({
          label: this._translateService.instant("ERROR"),
          message: this._translateService.instant("IMPROVE_POST_TEXT_WITH_AI_FAILED"),
          variant: EVariant.DANGER
        });
      }
    });
  }

  private setPostContent(value: string): void {
    this.postControls.content.setValue(value);
    this.postControls.content.markAsDirty();
    this.postContent.set(value);
  }
}
