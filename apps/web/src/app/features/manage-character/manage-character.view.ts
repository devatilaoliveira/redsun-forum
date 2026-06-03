import {Component, computed, inject, OnDestroy, OnInit, Signal, signal, WritableSignal} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from "@angular/forms";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {finalize} from "rxjs";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {ERuleSystem} from "../../../interface/enums/ERuleSystem";
import {EVariant} from "../../../interface/enums/EVariant";
import {
  BasicSheetDTO,
  CharacterSheetResponseDTO
} from "../../../interface/dtos/characterSheet/CharacterSheetDTO";
import {CharacterSheetService, ICharacterSheetService} from "../../../services/character-sheet.service";
import {ILocalStoreService, LocalStoreService} from "../../../services/local-store.service";
import {ITaleService, TaleService} from "../../../services/tale.service";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";
import {RsTextarea} from "../../shared/fragments/rsTextarea/rs.textarea";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {RsDialogModalComponent} from "../../shared/ui/dialog-modal/dialog-modal.component";
import {UpsertCharacterSheetDTO} from "../../../interface/dtos/characterSheet/UpsertCharacterSheetDTO";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {RsAvatar} from "../../shared/fragments/rsAvatar/rs.avatar";
import {ImageCropperComponent, ImageCroppedEvent} from "ngx-image-cropper";
import {ImageHandler} from "../../../infra/miscellaneous/image.handler";
import {IToastService, ToastService} from "../../../services/toast.service";
import {TalesContextService} from "../../../stateServices/tales-context.service";
import {RedSunSheetComponent} from "./redsun-sheet/redsun-sheet.component";

interface CharacterSheetFormControls {
  characterName: FormControl<string>;
  characterDescription: FormControl<string>;
}

type CharacterSheetFormValue = { [K in keyof CharacterSheetFormControls]: string };

@Component({
  selector: "rs-manage-character",
  standalone: true,
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    RsViewHeader,
    RsInput,
    RsTextarea,
    RsButton,
    RsSpinner,
    RsDialogModalComponent,
    RsAvatar,
    ImageCropperComponent,
    RedSunSheetComponent
  ],
  templateUrl: "./manage-character.view.html",
  styleUrl: "./manage-character.view.scss"
})
export class ManageCharacterView implements OnInit, OnDestroy {
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _router: Router = inject(Router);
  private readonly _formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly _taleService: ITaleService = inject(TaleService);
  private readonly _characterSheetService: ICharacterSheetService = inject(CharacterSheetService);
  private readonly _localStoreService: ILocalStoreService = inject(LocalStoreService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _toastService: IToastService = inject(ToastService);
  private readonly _talesContext: TalesContextService = inject(TalesContextService);
  private readonly taleId: string = this._route.snapshot.paramMap.get(ROUTE_PATHS.taleId)!;
  private readonly characterSheetId: string = this._localStoreService.getAuthenticatedUser().id;
  private initialState: CharacterSheetFormValue | null = null;
  private avatarPreviewObjectUrl: string | null = null;
  private currentRuleSystem: ERuleSystem | null = null;

  protected readonly characterSheetFormGroup: FormGroup<CharacterSheetFormControls> = this._formBuilder.group({
    characterName: this._formBuilder.control<string>(""),
    characterDescription: this._formBuilder.control<string>("")
  });
  protected readonly controls = this.characterSheetFormGroup.controls;
  protected readonly sheetLoading: WritableSignal<boolean> = signal(true);
  protected readonly saveInProgress: WritableSignal<boolean> = signal(false);
  protected readonly confirmQuitOpen: WritableSignal<boolean> = signal(false);
  protected readonly leavingInProgress: WritableSignal<boolean> = signal(false);
  protected readonly pendingAvatarFile: WritableSignal<File | null> = signal<File | null>(null);
  protected readonly avatarPreviewUrl: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly characterImageUrl: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly avatarCropOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly avatarCropFile: WritableSignal<File | undefined> = signal<File | undefined>(undefined);
  protected readonly avatarCropBlob: WritableSignal<Blob | null> = signal<Blob | null>(null);
  protected readonly avatarUploading: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly isTaleOwner: Signal<boolean> = computed(() => this._talesContext.owner()?.id === this.characterSheetId);
  protected readonly EVariant = EVariant;

  public ngOnInit(): void {
    this._characterSheetService.getMyCharacterSheet(this.taleId, this.characterSheetId).pipe(
      finalize(() => this.sheetLoading.set(false))
    ).subscribe({
      next: (response: CharacterSheetResponseDTO) => this.applyLoadedSheet(response),
      error: (err: unknown) => {
        this._printer.error("failed to load character sheet", err);
        this.openToast("CHARACTER_SHEET_LOAD_ERROR");
      }
    });
  }

  protected isRedSunSheet(): boolean {
    return true;
    // return this.currentRuleSystem === ERuleSystem.REDSUN;
  }

  public ngOnDestroy(): void {
    this.revokeAvatarPreviewUrl();
  }

  protected onValueChange(formControl: FormControl<string>, value: string): void {
    formControl.setValue(value);
    formControl.markAsDirty();
  }

  protected avatarImageSrc(): string | null {
    return this.avatarPreviewUrl() ?? this.characterImageUrl();
  }

  protected onAvatarFileSelected(file: File): void {
    if (this.saveInProgress() || this.avatarUploading()) {
      return;
    }

    this.avatarCropFile.set(file);
    this.avatarCropBlob.set(null);
    this.avatarCropOpen.set(true);
  }

  protected onAvatarCropped(event: ImageCroppedEvent): void {
    this.avatarCropBlob.set(event.blob ?? null);
  }

  protected closeAvatarCrop(): void {
    if (this.avatarUploading()) {
      return;
    }
    this.avatarCropOpen.set(false);
    this.avatarCropFile.set(undefined);
    this.avatarCropBlob.set(null);
  }

  protected async confirmAvatarCrop(): Promise<void> {
    if (this.avatarUploading()) {
      return;
    }

    const blob: Blob | null = this.avatarCropBlob();
    if (!blob) {
      return;
    }

    this.avatarUploading.set(true);
    try {
      const sourceName: string = this.avatarCropFile()?.name ?? "avatar.jpg";
      const croppedFile = new File([blob], sourceName, {type: blob.type || "image/jpeg"});
      const processed: File = await ImageHandler.resizeAndCompress(croppedFile);
      this.pendingAvatarFile.set(processed);
      this.setAvatarPreviewUrl(URL.createObjectURL(processed));
      this.avatarUploading.set(false);
      this.closeAvatarCrop();
    } catch (err: unknown) {
      this.avatarUploading.set(false);
      this._printer.error("avatar crop failed", err);
      this.openToast("AVATAR_UPDATE_FAILED");
    }
  }

  protected onSubmit(): void {
    this.characterSheetFormGroup.markAllAsTouched();
    if (this.characterSheetFormGroup.invalid || this.saveInProgress() || this.avatarUploading() || !this.hasChanges()) {
      return;
    }

    this.saveInProgress.set(true);
    this._characterSheetService.upsertCharacterSheet(
      this.taleId,
      this.characterSheetId,
      this.toUpsertRequest(),
      this.pendingAvatarFile()
    ).pipe(
      finalize(() => this.saveInProgress.set(false))
    ).subscribe({
      next: (response: CharacterSheetResponseDTO) => {
        this.applyLoadedSheet(response);
        this._talesContext.refreshTale();
      },
      error: (err: unknown) => {
        this._printer.error("failed to save character sheet", err);
        this.openToast("CHARACTER_SHEET_SAVE_ERROR");
      }
    });
  }

  protected onQuitPressed(): void {
    if (this.isTaleOwner()) {
      return;
    }

    this.confirmQuitOpen.set(true);
  }

  protected closeQuitConfirm(): void {
    this.confirmQuitOpen.set(false);
  }

  protected confirmQuit(): void {
    if (this.isTaleOwner() || this.leavingInProgress()) {
      return;
    }

    this.leavingInProgress.set(true);
    this._taleService.leaveTale(this.taleId).pipe(
      finalize(() => this.leavingInProgress.set(false))
    ).subscribe({
      next: () => {
        this.closeQuitConfirm();
        void this._router.navigate(["/"]);
      }
    });
  }

  protected hasChanges(): boolean {
    if (!this.initialState) {
      return this.pendingAvatarFile() !== null;
    }

    const formValue: CharacterSheetFormValue = this.getCurrentFormValue();
    return formValue.characterName !== this.initialState.characterName ||
      formValue.characterDescription !== this.initialState.characterDescription ||
      this.pendingAvatarFile() !== null;
  }

  private getCurrentFormValue(): CharacterSheetFormValue {
    return this.characterSheetFormGroup.getRawValue();
  }

  private applyLoadedSheet(response: CharacterSheetResponseDTO): void {
    this.resetAvatarUpload();
    this.currentRuleSystem = response.ruleSystem;
    this.characterImageUrl.set(response.sheet.characterImageUrl);
    this.patchForm(this.toFormValue(response.sheet));
  }

  private toFormValue(sheet: BasicSheetDTO): CharacterSheetFormValue {
    return {
      characterName: sheet.characterName ?? "",
      characterDescription: sheet.characterDescription ?? ""
    };
  }

  private toUpsertRequest(): UpsertCharacterSheetDTO {
    const formValue: CharacterSheetFormValue = this.getCurrentFormValue();
    return {
      sheet: {
        characterName: this.toNullableText(formValue.characterName),
        characterDescription: this.toNullableText(formValue.characterDescription)
      }
    };
  }

  private toNullableText(value: string): string | null {
    const normalizedValue: string = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : null;
  }

  private patchForm(characterSheet: CharacterSheetFormValue): void {
    this.characterSheetFormGroup.patchValue(characterSheet, {emitEvent: false});
    this.characterSheetFormGroup.markAsPristine();
    this.characterSheetFormGroup.markAsUntouched();
    this.initialState = {...characterSheet};
  }

  private resetAvatarUpload(): void {
    this.pendingAvatarFile.set(null);
    this.setAvatarPreviewUrl(null);
    this.avatarCropOpen.set(false);
    this.avatarCropFile.set(undefined);
    this.avatarCropBlob.set(null);
    this.avatarUploading.set(false);
  }

  private openToast(messageKey: string): void {
    this._toastService.show({
      label: this._translateService.instant("ERROR"),
      message: this._translateService.instant(messageKey),
      variant: EVariant.DANGER
    });
  }

  private setAvatarPreviewUrl(url: string | null): void {
    this.revokeAvatarPreviewUrl();
    this.avatarPreviewObjectUrl = url;
    this.avatarPreviewUrl.set(url);
  }

  private revokeAvatarPreviewUrl(): void {
    if (!this.avatarPreviewObjectUrl) {
      return;
    }

    URL.revokeObjectURL(this.avatarPreviewObjectUrl);
    this.avatarPreviewObjectUrl = null;
  }
}
