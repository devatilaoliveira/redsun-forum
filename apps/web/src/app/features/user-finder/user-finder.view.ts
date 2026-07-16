import {DestroyRef, computed, Component, inject, OnInit, Signal, signal, WritableSignal} from "@angular/core";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {HttpErrorResponse} from "@angular/common/http";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {Subject, debounceTime, distinctUntilChanged, finalize} from "rxjs";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsSelect} from "../../shared/fragments/rsSelect/rs.select";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {UserFinderCardComponent} from "../../shared/ui/user-finder-card/user-finder-card.component";
import {FindUsersFiltersDTO} from "../../../interface/dtos/user/FindUsersFiltersDTO";
import {UserFinderResultDTO} from "../../../interface/dtos/user/UserFinderResultDTO";
import {PageResponse} from "../../../interface/dtos/general/PageResponse";
import {EProfileLanguage} from "../../../interface/enums/EProfileLanguage";
import {EFavoriteRole} from "../../../interface/enums/EFavoriteRole";
import {ERuleSystem} from "../../../interface/enums/ERuleSystem";
import {EVariant} from "../../../interface/enums/EVariant";
import {LocalStoreService} from "../../../services/local-store.service";
import {ContactService, IContactService} from "../../../services/contact.service";
import {IToastService, ToastService} from "../../../services/toast.service";
import {IUserFinderService, UserFinderService} from "../../../services/user-finder.service";

@Component({
  selector: "rs-user-finder",
  standalone: true,
  imports: [TranslatePipe, RsButton, RsInput, RsSelect, RsSpinner, RsViewHeader, UserFinderCardComponent],
  templateUrl: "./user-finder.view.html",
  styleUrl: "./user-finder.view.scss"
})
export class UserFinderView implements OnInit {
  private readonly _userFinderService: IUserFinderService = inject(UserFinderService);
  private readonly _contactService: IContactService = inject(ContactService);
  private readonly _localStoreService: LocalStoreService = inject(LocalStoreService);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _toastService: IToastService = inject(ToastService);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _usernameFilterChanges: Subject<string> = new Subject<string>();
  private readonly pageSize: number = 10;

  protected readonly EProfileLanguage = EProfileLanguage;
  protected readonly EFavoriteRole = EFavoriteRole;
  protected readonly ERuleSystem = ERuleSystem;
  protected readonly EVariant = EVariant;
  protected readonly users: WritableSignal<UserFinderResultDTO[]> = signal<UserFinderResultDTO[]>([]);
  protected readonly usersPage: WritableSignal<PageResponse<UserFinderResultDTO> | null> = signal<PageResponse<UserFinderResultDTO> | null>(null);
  protected readonly usernameFilter: WritableSignal<string> = signal<string>("");
  protected readonly selectedRole: WritableSignal<EFavoriteRole | null> = signal<EFavoriteRole | null>(null);
  protected readonly selectedRules: WritableSignal<ERuleSystem | null> = signal<ERuleSystem | null>(null);
  protected readonly selectedLanguage: WritableSignal<EProfileLanguage | null> = signal<EProfileLanguage | null>(null);
  protected readonly loading: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly loadingMore: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly addingContactId: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly accountError: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly hasUsers: Signal<boolean> = computed<boolean>(() => this.users().length > 0);
  protected readonly canLoadMore: Signal<boolean> = computed<boolean>(() => {
    const page = this.usersPage()?.page;
    if (!page) {
      return false;
    }
    return this.users().length < page.totalElements;
  });
  protected readonly loadedCount: Signal<number> = computed<number>(() => this.users().length);
  protected readonly totalCount: Signal<number> = computed<number>(() => this.usersPage()?.page.totalElements ?? this.users().length);
  protected readonly authenticatedUser = this._localStoreService.user;

  public ngOnInit(): void {
    this._usernameFilterChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(() => {
      this.loadUsers(0, false);
    });

    this.loadUsers(0, false);
  }

  protected onUsernameChange(value: string): void {
    this.usernameFilter.set(value);
    this._usernameFilterChanges.next(value.trim());
  }

  protected onRoleChange(value: string | null): void {
    this.selectedRole.set(this.toEnumValue(EFavoriteRole, value));
    this.loadUsers(0, false);
  }

  protected onRulesChange(value: string | null): void {
    this.selectedRules.set(this.toEnumValue(ERuleSystem, value));
    this.loadUsers(0, false);
  }

  protected onLanguageChange(value: string | null): void {
    this.selectedLanguage.set(this.toEnumValue(EProfileLanguage, value));
    this.loadUsers(0, false);
  }

  protected isAlreadyContact(userId: string): boolean {
    const authenticatedUser = this.authenticatedUser();
    if (!authenticatedUser) {
      return false;
    }
    return authenticatedUser.contacts.some((contact) => contact.id === userId);
  }

  protected isCurrentUser(userId: string): boolean {
    return this.authenticatedUser()?.id === userId;
  }

  protected addToContacts(user: UserFinderResultDTO): void {
    if (!user.id || this.addingContactId() || this.isAlreadyContact(user.id) || this.isCurrentUser(user.id)) {
      return;
    }

    this.addingContactId.set(user.id);
    this._contactService.addContactById(user.id).pipe(
      finalize(() => this.addingContactId.set(null))
    ).subscribe({
      next: (contact) => {
        const authenticatedUser = this.authenticatedUser();
        if (!authenticatedUser) {
          return;
        }

        this._localStoreService.updateContacts([contact, ...authenticatedUser.contacts]);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.openToast(this._translateService.instant("CONTACT_ADD_NOT_FOUND"));
          return;
        }

        if (err.status === 409) {
          this.openToast(this._translateService.instant("CONTACT_ADD_EXISTS"));
          return;
        }

        if (err.status === 403) {
          this.openToast(this._translateService.instant("CONTACT_ADD_SELF"));
          return;
        }

        this.openToast(this._translateService.instant("CONTACT_ADD_FAILED"));
      }
    });
  }

  protected loadMore(): void {
    if (!this.canLoadMore() || this.loading() || this.loadingMore()) {
      return;
    }

    const nextPage = (this.usersPage()?.page.number ?? 0) + 1;
    this.loadUsers(nextPage, true);
  }

  private loadUsers(page: number, append: boolean): void {
    if (append) {
      this.loadingMore.set(true);
    } else {
      this.loading.set(true);
      this.accountError.set(false);
    }

    this._userFinderService.findUsers(this.buildFilters(page)).pipe(
      finalize(() => {
        if (append) {
          this.loadingMore.set(false);
        } else {
          this.loading.set(false);
        }
      })
    ).subscribe((users) => {
      const mergedContent = append
        ? [...this.users(), ...users.content]
        : users.content;

      this.users.set(mergedContent);
      this.usersPage.set({
        ...users,
        content: mergedContent
      });
    }, (err: HttpErrorResponse) => {
      this.handleFindUsersError(err, append);
    });
  }

  private buildFilters(page: number): FindUsersFiltersDTO {
    return {
      page,
      size: this.pageSize,
      userName: this.usernameFilter().trim() || null,
      role: this.selectedRole(),
      rule: this.selectedRules(),
      language: this.selectedLanguage()
    };
  }

  private handleFindUsersError(err: HttpErrorResponse, append: boolean): void {
    if (err.status === 400) {
      this.selectedRole.set(null);
      this.selectedRules.set(null);
      this.selectedLanguage.set(null);
      this.openToast(this._translateService.instant("INVALID_FILTERS_RESET"));
      if (!append) {
        this.loadUsers(0, false);
      }
      return;
    }

    if (err.status === 404) {
      this.accountError.set(true);
      this.users.set([]);
      this.usersPage.set(null);
      return;
    }

    this.openToast(this._translateService.instant("COULD_NOT_LOAD_USERS"));
  }

  private openToast(message: string): void {
    this._toastService.show({
      label: this._translateService.instant("ERROR"),
      message,
      variant: EVariant.DANGER
    });
  }

  private toEnumValue<T extends string>(options: Record<string, T>, value: string | null): T | null {
    if (!value) {
      return null;
    }
    const allowedValues: T[] = Object.values(options);
    return allowedValues.includes(value as T) ? value as T : null;
  }
}
