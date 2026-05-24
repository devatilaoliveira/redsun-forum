import {Component, computed, inject, OnInit, signal, Signal, WritableSignal} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {finalize} from "rxjs";
import {UserAsContactProfileDTO} from "../../../interface/dtos/user/UserAsContactProfileDTO";
import {ContactService, IContactService} from "../../../services/contact.service";
import {RsContactCard} from "../../shared/fragments/rsContactCard/rs.contact-card";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {EVariant} from "../../../interface/enums/EVariant";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {LocalStoreService} from "../../../services/local-store.service";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {ContactAboutCardComponent} from "../../shared/ui/contact-about-card/contact-about-card.component";

@Component({
  selector: "rs-contact-details",
  standalone: true,
  imports: [TranslatePipe, RsContactCard, RsSpinner, RsButton, ContactAboutCardComponent],
  templateUrl: "./contact-details.view.html",
  styleUrl: "./contact-details.view.scss"
})
export class ContactDetailsView implements OnInit {
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);
  private readonly _contactService: IContactService = inject(ContactService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _localStoreService: LocalStoreService = inject(LocalStoreService);

  protected readonly contact: WritableSignal<UserAsContactProfileDTO | null> =
    signal<UserAsContactProfileDTO | null>(null);
  protected readonly isLoading: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly isAdding: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly isRemoving: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly contactId: string | null = this._route.snapshot.paramMap.get(ROUTE_PATHS.id);
  protected readonly EVariant = EVariant;
  protected readonly isSelf: Signal<boolean> = computed(() => {
    const currentUser = this._localStoreService.user();
    const currentContactId = this.contact()?.id;
    return !!currentUser && !!currentContactId && currentUser.id === currentContactId;
  });
  protected readonly isAlreadyContact: Signal<boolean> = computed(() => {
    const currentUser = this._localStoreService.user();
    const currentContactId = this.contact()?.id;
    if (!currentUser || !currentContactId) return false;
    if (currentUser.id === currentContactId) return true;
    return currentUser.contacts?.some((contact) => contact.id === currentContactId) ?? false;
  });

  public ngOnInit(): void {
    if (!this.contactId) {
      return;
    }

    this.isLoading.set(true);
    this._contactService.getUserAsContactProfile(this.contactId).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (contact) => this.contact.set(contact),
      error: (err) => {
        this.contact.set(null);
        this._printer.error("failed to load contact profile", err);
      }
    });
  }

  protected onAddContact(): void {
    const contactId = this.contact()?.id ?? this.contactId;
    if (!contactId || this.isAdding() || this.isAlreadyContact()) {
      return;
    }

    this.isAdding.set(true);
    this._contactService.addContactById(contactId).pipe(
      finalize(() => this.isAdding.set(false))
    ).subscribe({
      next: (addedContact) => {
        const currentUser = this._localStoreService.user();
        if (!currentUser) return;
        this._localStoreService.storeUser({
          ...currentUser,
          contacts: [addedContact, ...(currentUser.contacts ?? [])]
        });
      },
      error: (err) => {
        this._printer.error("failed to add contact", err);
      }
    });
  }

  protected onRemoveContact(): void {
    const contactId = this.contact()?.id ?? this.contactId;
    if (!contactId || this.isRemoving() || !this.isAlreadyContact()) {
      return;
    }

    this.isRemoving.set(true);
    this._contactService.removeContactById(contactId).pipe(
      finalize(() => this.isRemoving.set(false))
    ).subscribe({
      next: () => {
        const currentUser = this._localStoreService.user();
        if (!currentUser) return;
        const updatedContacts = (currentUser.contacts ?? []).filter((contact) => contact.id !== contactId);
        this._localStoreService.storeUser({
          ...currentUser,
          contacts: updatedContacts
        });
      },
      error: (err) => {
        this._printer.error("failed to remove contact", err);
      }
    });
  }

  protected async onSendLetter(): Promise<void> {
    const contactId = this.contact()?.id ?? this.contactId;
    if (!contactId) {
      return;
    }

    void this._router.navigate(["/", ROUTE_PATHS.contacts, ROUTE_PATHS.details, ROUTE_PATHS.letter, contactId]);
  }

}
