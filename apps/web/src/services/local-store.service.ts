import {Injectable, computed, signal, WritableSignal, Signal} from "@angular/core";
import {MeResponseDTO} from "../interface/dtos/user/MeResponseDTO";
import {UserAsContactDTO} from "../interface/dtos/user/UserAsContactDTO";
import {ELanguage} from "../interface/enums/ELanguage";
import {LANG_STORE_KEY, USER_STORE_KEY} from "../interface/constants/store.constants";

export interface ILocalStoreService {
  getAuthenticatedUser(): MeResponseDTO;
  storeUser(user: MeResponseDTO | null): void;
  removeUser(): void;
  updateContacts(contacts: UserAsContactDTO[]): void;
  getLanguage(): ELanguage;
  setLanguage(lang: ELanguage): void;
}

@Injectable({providedIn: "root"})
export class LocalStoreService implements ILocalStoreService {
  private readonly _user: WritableSignal<MeResponseDTO | null>;

  readonly user: Signal<MeResponseDTO | null>;

  constructor() {
    const storedUser: string | null = localStorage.getItem(USER_STORE_KEY);
    this._user = signal<MeResponseDTO | null>(
      storedUser ? JSON.parse(storedUser) : null
    );

    this.user = computed(() => this._user());
  }

  public getAuthenticatedUser(): MeResponseDTO {
    return this._user()!;
  }

  public storeUser(user: MeResponseDTO | null): void {
    this._user.set(user);
    if (user) {
      localStorage.setItem(USER_STORE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORE_KEY);
    }
  }

  public removeUser(): void {
    this._user.set(null);
    localStorage.removeItem(USER_STORE_KEY);
  }

  public updateContacts(contacts: UserAsContactDTO[]): void {
    const currentUser = this._user();
    if (!currentUser) {
      return;
    }
    this.storeUser({
      ...currentUser,
      contacts
    });
  }

  public getLanguage(): ELanguage {
    const saved = localStorage.getItem(LANG_STORE_KEY) as ELanguage | null;
    if (!saved) {
      this.setLanguage(ELanguage.EN);
      return ELanguage.EN;
    }
    return saved;
  }

  public setLanguage(lang: ELanguage): void {
    localStorage.setItem(LANG_STORE_KEY, lang);
  }
}
