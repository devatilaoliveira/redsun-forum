import {
  Component,
  computed,
  effect,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal
} from "@angular/core";
import {UserAsContactDTO} from "../../../../interface/dtos/user/UserAsContactDTO";

@Component({
  selector: "rs-contacts-multi-select",
  standalone: true,
  imports: [],
  templateUrl: "./rs.contacts-multi-select.html",
  styleUrl: "./rs.contacts-multi-select.scss"
})
export class RsContactsMultiSelect {
  private static nextId: number = 0;
  private readonly uniqueId: string = `rs-contacts-multi-select-${RsContactsMultiSelect.nextId++}`;
  private readonly minSearchLength: number = 3;
  private readonly maxOptions: number = 5;

  public readonly label: InputSignal<string | null> = input<string | null>(null);
  public readonly contacts: InputSignal<UserAsContactDTO[]> = input.required<UserAsContactDTO[]>();
  public readonly value: InputSignal<string[]> = input<string[]>([]);
  public readonly required: InputSignal<boolean> = input<boolean>(false);
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly placeholder: InputSignal<string | null> = input<string | null>(null);
  public readonly id: InputSignal<string | null> = input<string | null>(null);

  public readonly valueChanged: OutputEmitterRef<string[]> = output<string[]>();

  protected readonly currentValue: WritableSignal<string[]> = signal<string[]>(this.value());
  protected readonly query: WritableSignal<string> = signal<string>("");
  protected readonly isFocused: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly inputId: Signal<string> = computed<string>(() => this.id() ?? this.uniqueId);
  protected readonly selectedIds: Signal<Set<string>> = computed<Set<string>>(() => new Set(this.currentValue()));
  protected readonly placeholderText: Signal<string> = computed<string>(() => {
    const base: string | null = this.placeholder();
    if (!base) return "";
    return this.currentValue().length > 0 ? "" : base;
  });
  protected readonly selectedContacts: Signal<UserAsContactDTO[]> = computed<UserAsContactDTO[]>(() => {
    const lookup = new Map<string, UserAsContactDTO>(
      this.contacts()
        .filter((contact) => !!contact.id)
        .map((contact) => [contact.id as string, contact])
    );
    return this.currentValue().map((id) => lookup.get(id) ?? {id, username: id, imageURL: null});
  });
  protected readonly filteredOptions: Signal<UserAsContactDTO[]> = computed<UserAsContactDTO[]>(() => {
    const search: string = this.query().trim().toLowerCase();
    if (search.length < this.minSearchLength) return [];
    const selected: Set<string> = this.selectedIds();
    const matches: UserAsContactDTO[] = this.contacts().filter((contact) => {
      const contactId: string | null = contact.id;
      if (!contactId || selected.has(contactId)) return false;
      return contact.username.toLowerCase().includes(search);
    });
    return matches.slice(0, this.maxOptions);
  });
  protected readonly showDropdown: Signal<boolean> = computed<boolean>(() =>
    this.isFocused() && !this.disabled() && this.filteredOptions().length > 0
  );

  constructor() {
    effect(() => {
      const nextValue: string[] = this.value() ?? [];
      this.currentValue.set(Array.from(new Set(nextValue)));
    });
  }

  protected onInput(event: Event): void {
    if (this.disabled()) return;
    const nextValue: string = (event.target as HTMLInputElement | null)?.value ?? "";
    this.query.set(nextValue);
  }

  protected onFocus(): void {
    if (this.disabled()) return;
    this.isFocused.set(true);
  }

  protected onBlur(): void {
    this.isFocused.set(false);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key !== "Backspace" || this.query().length > 0) return;
    const current: string[] = this.currentValue();
    if (current.length === 0) return;
    const nextValue: string[] = current.slice(0, -1);
    this.currentValue.set(nextValue);
    this.valueChanged.emit(nextValue);
  }

  protected onOptionMouseDown(event: MouseEvent, contact: UserAsContactDTO): void {
    event.preventDefault();
    if (this.disabled()) return;
    this.addContact(contact);
  }

  protected removeContact(contactId: string | null): void {
    if (!contactId) return;
    const nextValue: string[] = this.currentValue().filter((id) => id !== contactId);
    this.currentValue.set(nextValue);
    this.valueChanged.emit(nextValue);
  }

  private addContact(contact: UserAsContactDTO): void {
    const contactId: string | null = contact.id;
    if (!contactId || this.selectedIds().has(contactId)) return;
    const nextValue: string[] = [...this.currentValue(), contactId];
    this.currentValue.set(nextValue);
    this.valueChanged.emit(nextValue);
    this.query.set("");
  }
}
