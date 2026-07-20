import {Component, computed, inject, OnInit, Signal, signal, WritableSignal} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";
import {finalize} from "rxjs";
import {PatchNoteDTO} from "../../../interface/dtos/patchNote/PatchNoteDTO";
import {EVariant} from "../../../interface/enums/EVariant";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {IPatchNoteService, PatchNoteService} from "../../../services/patch-note.service";
import {RsButtonText} from "../../shared/fragments/rsButtonText/rs.button-text";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {PatchNotesComponent} from "../../shared/ui/patch-notes/patch-notes.component";

@Component({
  selector: "rs-patch-notes-view",
  standalone: true,
  imports: [TranslatePipe, RsButtonText, RsSpinner, RsViewHeader, PatchNotesComponent],
  templateUrl: "./patch-notes.view.html",
  styleUrl: "./patch-notes.view.scss"
})
export class PatchNotesView implements OnInit {
  private readonly _patchNoteService: IPatchNoteService = inject(PatchNoteService);
  private readonly _printer: IPrinter = inject(Printer);

  protected readonly notes: WritableSignal<PatchNoteDTO[]> = signal<PatchNoteDTO[]>([]);
  protected readonly isInitialLoading: WritableSignal<boolean> = signal(false);
  protected readonly isLoadingMore: WritableSignal<boolean> = signal(false);
  protected readonly initialLoadFailed: WritableSignal<boolean> = signal(false);
  protected readonly loadMoreFailed: WritableSignal<boolean> = signal(false);
  protected readonly hasMore: WritableSignal<boolean> = signal(false);
  protected readonly hasNotes: Signal<boolean> = computed(() => this.notes().length > 0);
  protected readonly EVariant = EVariant;

  private readonly nextPage: WritableSignal<number> = signal(0);

  public ngOnInit(): void {
    this.loadPage(0, false);
  }

  protected retryInitialLoad(): void {
    this.loadPage(0, false);
  }

  protected loadMore(): void {
    if (!this.hasMore() || this.isLoadingMore()) return;
    this.loadPage(this.nextPage(), true);
  }

  private loadPage(page: number, append: boolean): void {
    if (append) {
      this.isLoadingMore.set(true);
      this.loadMoreFailed.set(false);
    } else {
      this.isInitialLoading.set(true);
      this.initialLoadFailed.set(false);
    }

    this._patchNoteService.getPatchNotes(page).pipe(
      finalize(() => append ? this.isLoadingMore.set(false) : this.isInitialLoading.set(false))
    ).subscribe({
      next: (pageData) => {
        const pageNotes = pageData.content ?? [];
        const mergedNotes = append ? [...this.notes(), ...pageNotes] : pageNotes;
        this.notes.set(mergedNotes);
        this.nextPage.set(pageData.page.number + 1);
        this.hasMore.set(pageData.page.number + 1 < pageData.page.totalPages && pageNotes.length > 0);
      },
      error: (error) => {
        this._printer.error(append ? "failed to load more patch notes" : "failed to load patch notes", error);
        if (append) {
          this.loadMoreFailed.set(true);
        } else {
          this.notes.set([]);
          this.hasMore.set(false);
          this.initialLoadFailed.set(true);
        }
      }
    });
  }
}
