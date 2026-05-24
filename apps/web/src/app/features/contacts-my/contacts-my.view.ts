import {Component, computed, inject, OnInit, Signal, signal, WritableSignal} from "@angular/core";
import {Router} from "@angular/router";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {finalize} from "rxjs";
import {ContactService, IContactService} from "../../../services/contact.service";
import {UserAsContactDTO} from "../../../interface/dtos/user/UserAsContactDTO";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {HttpErrorResponse} from "@angular/common/http";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {UtilFunctions} from "../../../infra/miscellaneous/util.functions";
import {EAction} from "../../../interface/enums/EAction";
import {RsMoreOption, RsMoreOptions} from "../../shared/fragments/rsMoreOptions/rs.more-options";
import {ILocalStoreService, LocalStoreService} from "../../../services/local-store.service";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {EVariant} from "../../../interface/enums/EVariant";
import {IToastService, ToastService} from "../../../services/toast.service";

@Component({
  selector: "rs-contacts-my",
  standalone: true,
  imports: [TranslatePipe, RsInput, RsButton, RsMoreOptions, RsViewHeader],
  templateUrl: "./contacts-my.view.html",
  styleUrl: "./contacts-my.view.scss"
})
export class ContactsMyView implements OnInit {
  private readonly _contactService: IContactService = inject(ContactService);
  private readonly _router: Router = inject(Router);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _localStoreService: ILocalStoreService = inject(LocalStoreService);
  private readonly _toastService: IToastService = inject(ToastService);

  protected readonly contacts: WritableSignal<UserAsContactDTO[]> = signal<UserAsContactDTO[]>([]);
  protected readonly hasContacts: Signal<boolean> = computed(() => this.contacts().length > 0);
  protected readonly contactIdentifier: WritableSignal<string> = signal<string>("");
  protected readonly inProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly isRemoving: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly EAction = EAction;
  protected readonly UtilFunctions = UtilFunctions;

  public ngOnInit(): void {
    this._contactService.listContacts().subscribe((contacts) => {
      this.contacts.set(contacts);
      this._localStoreService.updateContacts(contacts);
    });
  }

  protected onIdentifierChange(value: string): void {
    this.contactIdentifier.set(value);
  }

  protected onAddContact(): void {
    const identifier: string = this.contactIdentifier().trim();
    if (!identifier || this.inProgress()) {
      return;
    }

    this.inProgress.set(true);
    this._contactService.addContactByIdentifier(identifier).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: (contact) => {
        const nextContacts = [contact, ...this.contacts()];
        this.contacts.set(nextContacts);
        this._localStoreService.updateContacts(nextContacts);
        this.contactIdentifier.set("");
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
        console.error("Failed to add contact", err);
      }
    });
  }

  protected onContactPressed(contact: UserAsContactDTO): void {
    if (!contact?.id) {
      return;
    }
    void this._router.navigate(["/", ROUTE_PATHS.contacts, ROUTE_PATHS.details, contact.id]);
  }

  protected onOptionSelected(contact: UserAsContactDTO, option: RsMoreOption, index: number): void {
    if (!contact?.id) return;
    if (option.action !== EAction.DELETE) return;
    if (this.isRemoving()) return;

    this.isRemoving.set(true);
    this._contactService.removeContactById(contact.id).pipe(
      finalize(() => this.isRemoving.set(false))
    ).subscribe({
      next: () => {
        const currentContacts = this.contacts();
        if (index < 0 || index >= currentContacts.length) return;
        if (currentContacts[index]?.id !== contact.id) return;
        const nextContacts = currentContacts.slice();
        nextContacts.splice(index, 1);
        this.contacts.set(nextContacts);
        this._localStoreService.updateContacts(nextContacts);
      },
      error: (err) => {
        console.error("Failed to remove contact", err);
      }
    });
  }

  private openToast(message: string): void {
    this._toastService.show({
      label: this._translateService.instant("ERROR"),
      message,
      variant: EVariant.DANGER
    });
  }
}
