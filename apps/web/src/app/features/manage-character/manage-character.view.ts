import {Component, computed, HostListener, inject, OnDestroy, OnInit, Signal, signal, ViewChild, WritableSignal} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
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
import {
  UpsertBasicSheetDTO,
  UpsertCharacterSheetDTO
} from "../../../interface/dtos/characterSheet/UpsertCharacterSheetDTO";
import {RedSunSheetResponseDTO} from "../../../interface/dtos/characterSheet/RedSunSheetResponseDTO";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {RsAvatar} from "../../shared/fragments/rsAvatar/rs.avatar";
import {RsRoundIconButton} from "../../shared/fragments/rsRoundIconButton/rs.round-icon-button";
import {ImageHandler} from "../../../infra/miscellaneous/image.handler";
import {IToastService, ToastService} from "../../../services/toast.service";
import {TalesContextService} from "../../../stateServices/tales-context.service";
import {RedSunSheetComponent} from "./redsun-sheet/redsun-sheet.component";
import {RsImageCropDialogComponent} from "../../shared/ui/image-crop-dialog/image-crop-dialog.component";
import {UTIL_CONSTANTS} from "../../../interface/constants/util.constants";

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
    RsRoundIconButton,
    RedSunSheetComponent,
    RsImageCropDialogComponent
  ],
  templateUrl: "./manage-character.view.html",
  styleUrl: "./manage-character.view.scss"
})
export class ManageCharacterView implements OnInit, OnDestroy {
  @ViewChild(RedSunSheetComponent) private redSunSheetComponent?: RedSunSheetComponent;

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
  private readonly authenticatedUserId: string = this._localStoreService.getAuthenticatedUser().id;
  private readonly characterSheetId: string = this._route.snapshot.paramMap.get(ROUTE_PATHS.id) ?? this.authenticatedUserId;
  private readonly isSelfProfile: boolean = this.characterSheetId === this.authenticatedUserId;
  private initialState: CharacterSheetFormValue | null = null;
  private avatarPreviewObjectUrl: string | null = null;

  protected readonly characterNameMaxLength: number = UTIL_CONSTANTS.USERNAME_MAX_LENGTH;
  protected readonly characterDescriptionMaxLength: number = UTIL_CONSTANTS.EXTRA_LONG_TEXT_LENGTH;
  protected readonly characterSheetFormGroup: FormGroup<CharacterSheetFormControls> = this._formBuilder.group({
    characterName: this._formBuilder.control<string>("", {
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(this.characterNameMaxLength)]
    }),
    characterDescription: this._formBuilder.control<string>("", {
      validators: [Validators.maxLength(this.characterDescriptionMaxLength)]
    })
  });
  protected readonly controls = this.characterSheetFormGroup.controls;
  protected readonly sheetLoading: WritableSignal<boolean> = signal(true);
  protected readonly saveInProgress: WritableSignal<boolean> = signal(false);
  protected readonly confirmQuitOpen: WritableSignal<boolean> = signal(false);
  protected readonly confirmExitEditOpen: WritableSignal<boolean> = signal(false);
  protected readonly leavingInProgress: WritableSignal<boolean> = signal(false);
  protected readonly pendingAvatarFile: WritableSignal<File | null> = signal<File | null>(null);
  protected readonly avatarPreviewUrl: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly characterImageUrl: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly redSunSheet: WritableSignal<RedSunSheetResponseDTO | null> = signal<RedSunSheetResponseDTO | null>(null);
  protected readonly avatarCropOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly avatarCropFile: WritableSignal<File | undefined> = signal<File | undefined>(undefined);
  protected readonly avatarCropBlob: WritableSignal<Blob | null> = signal<Blob | null>(null);
  protected readonly avatarUploading: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly sheetEditable: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly currentRuleSystem: WritableSignal<ERuleSystem | null> = signal<ERuleSystem | null>(null);
  protected readonly isTargetTaleOwner: Signal<boolean> = computed(() => this._talesContext.owner()?.id === this.characterSheetId);
  protected readonly canQuitTale: Signal<boolean> = computed(() => this.isSelfProfile && !this.isTargetTaleOwner());
  protected readonly isRedSunSheet: Signal<boolean> = computed(() =>
    this.currentRuleSystem() === ERuleSystem.REDSUN && !this.isTargetTaleOwner()
  );
  protected readonly avatarImageSrc: Signal<string | null> = computed(() =>
    this.avatarPreviewUrl() ?? this.characterImageUrl()
  );
  protected readonly headerTitleKey: Signal<string> = computed(() =>
    this.isSelfProfile ? "MANAGE_PROFILE" : "TALE_PARTICIPANT_PROFILE"
  );
  protected readonly headerSubtitleKey: Signal<string> = computed(() =>
    this.isSelfProfile ? "CHARACTER_SHEET_SUBTITLE" : "TALE_PARTICIPANT_PROFILE_SUBTITLE"
  );
  protected readonly sheetButtonIcon: Signal<string> = computed<string>(() => {
    return this.sheetEditable() ? "/assets/svgs/save.svg" : "/assets/svgs/edit.svg";
  });
  protected readonly sheetButtonLabel: Signal<string> = computed<string>(() => {
    return this.sheetEditable() ? this._translateService.instant("SAVE") : this._translateService.instant("EDIT");
  });
  protected readonly EVariant = EVariant;

  public ngOnInit(): void {
    this._characterSheetService.getCharacterSheet(this.taleId, this.characterSheetId).pipe(
      finalize(() => this.sheetLoading.set(false))
    ).subscribe({
      next: (response: CharacterSheetResponseDTO) => this.applyLoadedSheet(response),
      error: (err: unknown) => {
        this._printer.error("failed to load character sheet", err);
        this.openToast("CHARACTER_SHEET_LOAD_ERROR");
      }
    });
  }

  public ngOnDestroy(): void {
    this.revokeAvatarPreviewUrl();
  }

  @HostListener("document:keydown.escape", ["$event"])
  protected onEscapePressed(event: Event): void {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }

    if (!this.sheetEditable() || this.avatarCropOpen() || this.confirmQuitOpen() || this.confirmExitEditOpen()) {
      return;
    }

    event.preventDefault();
    this.tryLeaveEditMode();
  }

  protected onValueChange(formControl: FormControl<string>, value: string): void {
    formControl.setValue(value);
    formControl.markAsDirty();
  }

  protected onAvatarFileSelected(file: File): void {
    if (!this.sheetEditable() || this.saveInProgress() || this.avatarUploading()) {
      return;
    }

    this.avatarCropFile.set(file);
    this.avatarCropBlob.set(null);
    this.avatarCropOpen.set(true);
  }

  protected onAvatarCropped(blob: Blob | null): void {
    this.avatarCropBlob.set(blob);
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

  protected onSheetButtonPressed(): void {
    if (!this.sheetEditable()) {
      this.sheetEditable.set(true);
      return;
    }

    this.characterSheetFormGroup.markAllAsTouched();
    this.redSunSheetComponent?.markAllAsTouched();

    if (
      this.characterSheetFormGroup.invalid ||
      this.redSunSheetComponent?.isInvalid() ||
      this.saveInProgress() ||
      this.avatarUploading()
    ) {
      return;
    }

    if (!this.hasChanges()) {
      this.sheetEditable.set(false);
      return;
    }

    this.saveSheet();
  }

  protected tryLeaveEditMode(): void {
    if (!this.sheetEditable() || this.saveInProgress() || this.avatarUploading()) {
      return;
    }

    if (!this.hasChanges()) {
      this.leaveEditMode();
      return;
    }

    this.confirmExitEditOpen.set(true);
  }

  protected closeExitEditConfirm(): void {
    this.confirmExitEditOpen.set(false);
  }

  protected confirmExitEditMode(): void {
    this.confirmExitEditOpen.set(false);
    this.restoreLastSavedSheet();
    this.leaveEditMode();
  }

  private saveSheet(): void {
    this.saveInProgress.set(true);
    this._characterSheetService.upsertCharacterSheet(
      this.taleId,
      this.characterSheetId,
      this.requireRuleSystem(),
      this.toUpsertRequest(),
      this.pendingAvatarFile(),
      this.isTargetTaleOwner()
    ).pipe(
      finalize(() => this.saveInProgress.set(false))
    ).subscribe({
      next: (response: CharacterSheetResponseDTO) => {
        this.applyLoadedSheet(response);
        this.sheetEditable.set(false);
        this._talesContext.refreshTale();
        this.openToast("CHARACTER_SHEET_SAVE_SUCCESS", EVariant.SUCCESS);
      },
      error: (err: unknown) => {
        this._printer.error("failed to save character sheet", err);
        this.openToast("CHARACTER_SHEET_SAVE_ERROR");
      }
    });
  }

  protected onQuitPressed(): void {
    if (!this.canQuitTale()) {
      return;
    }

    this.confirmQuitOpen.set(true);
  }

  protected closeQuitConfirm(): void {
    this.confirmQuitOpen.set(false);
  }

  protected confirmQuit(): void {
    if (!this.canQuitTale() || this.leavingInProgress()) {
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
    if (this.redSunSheetComponent?.isDirty()) {
      return true;
    }

    if (this.characterSheetFormGroup.dirty || this.pendingAvatarFile() !== null) {
      return true;
    }

    if (!this.initialState) {
      return false;
    }

    const formValue: CharacterSheetFormValue = this.getCurrentFormValue();
    return formValue.characterName !== this.initialState.characterName ||
      formValue.characterDescription !== this.initialState.characterDescription;
  }

  private getCurrentFormValue(): CharacterSheetFormValue {
    return this.characterSheetFormGroup.getRawValue();
  }

  private applyLoadedSheet(response: CharacterSheetResponseDTO): void {
    this.resetAvatarUpload();
    this.currentRuleSystem.set(response.ruleSystem);
    this.characterImageUrl.set(response.sheet.characterImageUrl);
    this.patchForm(this.toFormValue(response.sheet));
    if (this.isRedSunSheet()) {
      this.redSunSheet.set(response.sheet as RedSunSheetResponseDTO);
    } else if (!this.isRedSunSheet()) {
      this.redSunSheet.set(null);
    }
  }

  private toFormValue(sheet: BasicSheetDTO): CharacterSheetFormValue {
    return {
      characterName: sheet.characterName ?? "",
      characterDescription: sheet.characterDescription ?? ""
    };
  }

  private toUpsertRequest(): UpsertCharacterSheetDTO {
    const formValue: CharacterSheetFormValue = this.getCurrentFormValue();
    const basicRequest: UpsertBasicSheetDTO = {
      characterName: formValue.characterName.trim(),
      characterDescription: this.toNullableText(formValue.characterDescription)
    };

    if (this.isRedSunSheet() && this.redSunSheetComponent) {
      return {
        ...basicRequest,
        ...this.redSunSheetComponent.toUpsertDto()
      };
    }

    return basicRequest;
  }

  private requireRuleSystem(): ERuleSystem {
    const ruleSystem: ERuleSystem | null = this.currentRuleSystem();
    if (ruleSystem === null) {
      throw new Error("Character sheet rule system is not loaded.");
    }

    return ruleSystem;
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

  private leaveEditMode(): void {
    this.sheetEditable.set(false);
  }

  private restoreLastSavedSheet(): void {
    if (this.initialState) {
      this.patchForm(this.initialState);
    }

    this.redSunSheetComponent?.patchValue(this.redSunSheet());
    this.resetAvatarUpload();
  }

  private resetAvatarUpload(): void {
    this.pendingAvatarFile.set(null);
    this.setAvatarPreviewUrl(null);
    this.avatarCropOpen.set(false);
    this.avatarCropFile.set(undefined);
    this.avatarCropBlob.set(null);
    this.avatarUploading.set(false);
  }

  private openToast(messageKey: string, variant: EVariant = EVariant.DANGER): void {
    this._toastService.show({
      label: this._translateService.instant(variant === EVariant.SUCCESS ? "SUCCESS" : "ERROR"),
      message: this._translateService.instant(messageKey),
      variant
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
