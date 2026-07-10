import {Injectable, computed, signal, WritableSignal, Signal} from "@angular/core";
import {MeResponseDTO} from "../interface/dtos/user/MeResponseDTO";
import {UserAsContactDTO} from "../interface/dtos/user/UserAsContactDTO";
import {USER_STORE_KEY} from "../interface/constants/store.constants";

export interface ILocalStoreService {
  getAuthenticatedUser(): MeResponseDTO;
  storeUser(user: MeResponseDTO | null): void;
  removeUser(): void;
  updateContacts(contacts: UserAsContactDTO[]): void;
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

}
