import {computed, inject, Injectable, Signal, signal, WritableSignal} from "@angular/core";
import {TaleDetailDTO} from "../interface/dtos/tale/TaleDetailDTO";
import {TaleParticipantProfileDTO} from "../interface/dtos/tale/TaleParticipantProfileDTO";
import {TaleAccessRole} from "../interface/enums/TaleAccessRole";
import {LocalStoreService} from "../services/local-store.service";

@Injectable({providedIn: "root"})
export class TaleContextStateService {
  private readonly _localStore: LocalStoreService = inject(LocalStoreService);
  private readonly _taleId: WritableSignal<string | null> = signal<string | null>(null);
  private readonly _tale: WritableSignal<TaleDetailDTO | null> = signal<TaleDetailDTO | null>(null);
  private readonly _isLoading: WritableSignal<boolean> = signal<boolean>(false);

  public readonly taleId: Signal<string | null> = this._taleId.asReadonly();
  public readonly tale: Signal<TaleDetailDTO | null> = this._tale.asReadonly();
  public readonly role: Signal<TaleAccessRole> = computed(() =>
    this.resolveRole(this._tale(), this._localStore.user()?.id)
  );
  public readonly isLoading: Signal<boolean> = this._isLoading.asReadonly();
  public readonly participants: Signal<TaleParticipantProfileDTO[]> = computed(() => this._tale()?.participants ?? []);
  public readonly owner: Signal<TaleParticipantProfileDTO | null> = computed(() => this._tale()?.author ?? null);
  public readonly canManage: Signal<boolean> = computed(() => this.role() === TaleAccessRole.Owner);
  public readonly canPlay: Signal<boolean> = computed(() => {
    const role: TaleAccessRole = this.role();
    return role === TaleAccessRole.Owner || role === TaleAccessRole.Participant;
  });

  public startLoading(taleId: string | null): void {
    this._taleId.set(taleId);
    this._tale.set(null);
    this._isLoading.set(!!taleId);
  }

  public setLoading(isLoading: boolean): void {
    this._isLoading.set(isLoading);
  }

  public setTale(tale: TaleDetailDTO): void {
    this._tale.set(tale);
    this._taleId.set(tale.id);
  }

  public clear(): void {
    this._taleId.set(null);
    this._tale.set(null);
    this._isLoading.set(false);
  }

  public clearTale(taleId: string | null = this._taleId()): void {
    this._taleId.set(taleId);
    this._tale.set(null);
    this._isLoading.set(false);
  }

  public clearIfCurrent(taleId: string | null): void {
    if (this._taleId() !== taleId) {
      return;
    }

    this.clear();
  }

  private resolveRole(tale: TaleDetailDTO | null, userId: string | undefined): TaleAccessRole {
    if (!tale || !userId) {
      return TaleAccessRole.None;
    }

    const isOwner = tale.author?.id === userId;
    if (isOwner) {
      return TaleAccessRole.Owner;
    }

    const isParticipant = (tale.participants ?? []).some((participant) => participant.id === userId);
    return isParticipant ? TaleAccessRole.Participant : TaleAccessRole.None;
  }
}
