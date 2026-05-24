import {Component, computed, effect, inject, OnDestroy, Signal, signal, WritableSignal} from "@angular/core";
import {Router} from "@angular/router";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {finalize} from "rxjs";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsTextarea} from "../../shared/fragments/rsTextarea/rs.textarea";
import {RsDataList} from "../../shared/fragments/rsDataList/rs.data-list";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsCheckbox} from "../../shared/fragments/rsCheckbox/rs.checkbox";
import {RsSelect} from "../../shared/fragments/rsSelect/rs.select";
import {RsImagePreview} from "../../shared/fragments/rsImagePreview/rs.image-preview";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {RsSpinner} from "../../shared/fragments/rsSpinner/rs.spinner";
import {TaleDetailDTO} from "../../../interface/dtos/tale/TaleDetailDTO";
import {ERuleSystem} from "../../../interface/enums/ERuleSystem";
import {EVariant} from "../../../interface/enums/EVariant";
import {UTIL_CONSTANTS} from "../../../interface/constants/util.constants";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {ITaleService, TaleService} from "../../../services/tale.service";
import {TaleUpdateRequestDTO} from "../../../interface/dtos/tale/TaleUpdateRequestDTO";
import {ImageCropperComponent, ImageCroppedEvent} from "ngx-image-cropper";
import {RsDialogModalComponent} from "../../shared/ui/dialog-modal/dialog-modal.component";
import {ImageHandler} from "../../../infra/miscellaneous/image.handler";
import {IToastService, ToastService} from "../../../services/toast.service";
import {ETaleLanguageSuggestion} from "../../../interface/enums/ETaleLanguageSuggestion";
import {TalesContextService} from "../../../stateServices/tales-context.service";

type EditTaleFormGroup = FormGroup<{
  taleName: FormControl<string>;
  description: FormControl<string>;
  language: FormControl<string>;
  isPublic: FormControl<boolean>;
  ruleSystem: FormControl<ERuleSystem>;
  image: FormControl<File | null>;
}>;

@Component({
  selector: "rs-tale-manager",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    RsInput,
    RsTextarea,
    RsDataList,
    RsButton,
    RsCheckbox,
    RsSelect,
    RsImagePreview,
    RsViewHeader,
    RsSpinner,
    RsDialogModalComponent,
    ImageCropperComponent
  ],
  templateUrl: "./tale-manager.view.html",
  styleUrl: "./tale-manager.view.scss"
})
export class TaleManagerView implements OnDestroy {
  private readonly _router: Router = inject(Router);
  private readonly _taleService: ITaleService = inject(TaleService);
  private readonly _fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _toastService: IToastService = inject(ToastService);
  private readonly _talesContext: TalesContextService = inject(TalesContextService);
  private imagePreviewUrl: string | null = null;
  private initialTaleApplied = false;
  protected readonly tale: Signal<TaleDetailDTO | null> = this._talesContext.tale;

  protected readonly UTIL_CONSTANTS = UTIL_CONSTANTS;
  protected readonly editTaleFormGroup: EditTaleFormGroup = this._fb.group({
    taleName: this._fb.control<string>("", {validators: [Validators.required, Validators.maxLength(UTIL_CONSTANTS.EXTRA_SHORT_TEXT_LENGTH)]}),
    description: this._fb.control<string>("", {validators: [Validators.required, Validators.maxLength(UTIL_CONSTANTS.EXTRA_LONG_TEXT_LENGTH)]}),
    language: this._fb.control<string>("", {validators: [Validators.maxLength(50)]}),
    isPublic: this._fb.control<boolean>(true),
    ruleSystem: this._fb.control<ERuleSystem>(ERuleSystem.DND_5E, {validators: [Validators.required]}),
    image: new FormControl<File | null>(null)
  });
  protected readonly controls = this.editTaleFormGroup.controls;
  protected readonly inProgress: WritableSignal<boolean> = signal(false);
  protected readonly removeImage: WritableSignal<boolean> = signal(false);
  protected readonly imageCropOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly imageCropFile: WritableSignal<File | undefined> = signal<File | undefined>(undefined);
  protected readonly imageCropBlob: WritableSignal<Blob | null> = signal<Blob | null>(null);
  protected readonly cropProcessing: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly imagePreview: WritableSignal<string | null> = signal<string | null>(null);
  protected readonly archiveDialogOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly archiveNameValue: WritableSignal<string> = signal<string>("");
  protected readonly archiveInProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly ruleChangeDialogOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly pendingRuleSystem: WritableSignal<ERuleSystem | null> = signal<ERuleSystem | null>(null);
  protected readonly ruleChangeNameValue: WritableSignal<string> = signal<string>("");
  protected readonly namePattern: RegExp = new RegExp(`^.{1,${UTIL_CONSTANTS.EXTRA_SHORT_TEXT_LENGTH}}$`);
  protected readonly canConfirmArchive: Signal<boolean> = computed(() => {
    const typed = this.archiveNameValue().trim();
    const taleName = this.initialState?.taleName?.trim() ?? "";
    return typed.length > 0 && typed === taleName;
  });
  protected readonly canConfirmRuleChange: Signal<boolean> = computed(() => {
    const typed = this.ruleChangeNameValue().trim();
    const taleName = this.initialState?.taleName?.trim() ?? "";
    const pendingRule = this.pendingRuleSystem();
    const currentRule = this.controls.ruleSystem.value;
    if (!pendingRule) return false;
    if (pendingRule === currentRule) return false;
    return typed.length > 0 && typed === taleName;
  });
  protected readonly ERuleSystem = ERuleSystem;
  protected readonly ETaleLanguageSuggestion = ETaleLanguageSuggestion;
  protected readonly EVariant = EVariant;
  private initialState: {
    taleName: string | null;
    description: string | null;
    language: string | null;
    isPublic: boolean | null;
    rules: ERuleSystem | string | null;
    hasImage: boolean;
  } | null = null;

  private readonly applyInitialTale = effect(() => {
    const tale = this.tale();
    if (!tale || this.initialTaleApplied) {
      return;
    }

    this.applyTaleToForm(tale);
    this.initialTaleApplied = true;
  });

  protected onNameChange(value: string): void {
    this.controls.taleName.setValue(value);
    this.controls.taleName.markAsDirty();
  }

  protected onDescriptionChange(value: string): void {
    this.controls.description.setValue(value);
    this.controls.description.markAsDirty();
  }

  protected onLanguageChange(value: string | null): void {
    this.controls.language.setValue(value ?? "");
    this.controls.language.markAsDirty();
  }

  protected onRuleSystemChange(value: string | null): void {
    const nextValue: ERuleSystem = value ? (value as ERuleSystem) : ERuleSystem.DND_5E;
    if (nextValue === this.controls.ruleSystem.value) {
      return;
    }
    if (this.inProgress() || this.archiveInProgress() || this.ruleChangeDialogOpen()) {
      return;
    }
    this.pendingRuleSystem.set(nextValue);
    this.ruleChangeNameValue.set("");
    this.ruleChangeDialogOpen.set(true);
  }

  protected onImageSelected(file: File): void {
    if (this.cropProcessing()) {
      return;
    }
    this.imageCropFile.set(file);
    this.imageCropBlob.set(null);
    this.imageCropOpen.set(true);
  }

  protected onImageCleared(): void {
    this.controls.image.setValue(null);
    this.controls.image.markAsDirty();
    this.removeImage.set(this.initialState?.hasImage ?? false);
    this.setImagePreview(null);
  }

  protected onImageCropped(event: ImageCroppedEvent): void {
    this.imageCropBlob.set(event.blob ?? null);
  }

  protected closeImageCrop(): void {
    if (this.cropProcessing()) {
      return;
    }
    this.resetImageCrop();
  }

  protected async confirmImageCrop(): Promise<void> {
    if (this.cropProcessing()) {
      return;
    }
    const blob = this.imageCropBlob();
    if (!blob) {
      return;
    }
    this.cropProcessing.set(true);
    try {
      const sourceName = this.imageCropFile()?.name ?? "tale-cover.jpg";
      const croppedFile = new File([blob], sourceName, {type: blob.type || "image/jpeg"});
      const processed = await ImageHandler.resizeAndCompress(
        croppedFile,
        UTIL_CONSTANTS.DEFAULT_RESIZE_WIDTH,
        UTIL_CONSTANTS.DEFAULT_RESIZE_HEIGHT
      );
      this.controls.image.setValue(processed);
      this.controls.image.markAsDirty();
      this.removeImage.set(false);
      this.setImagePreview(processed);
      this.resetImageCrop();
    } catch (err) {
      console.log("Error cropping tale image:", err);
    } finally {
      this.cropProcessing.set(false);
    }
  }

  protected onPublicToggle(checked: boolean): void {
    this.controls.isPublic.setValue(checked);
    this.controls.isPublic.markAsDirty();
  }

  protected onSubmit(): void {
    this.editTaleFormGroup.markAllAsTouched();
    if (this.editTaleFormGroup.invalid || this.inProgress() || this.archiveInProgress() || !this.hasChanges()) {
      return;
    }

    const tale = this.tale();
    if (!tale) {
      return;
    }

    this.inProgress.set(true);
    const payload: TaleUpdateRequestDTO = {
      taleName: this.controls.taleName.value,
      isPublic: this.controls.isPublic.value,
      description: this.controls.description.value,
      language: this.controls.language.value,
      rules: this.controls.ruleSystem.value,
      image: this.controls.image.value,
      removeImage: this.removeImage()
    };

    this._taleService.updateTale(tale.id, payload).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: (updated) => {
        this._talesContext.setTale(updated);
        this.applyTaleToForm(updated);
        this.removeImage.set(false);
        void this._router.navigate(["/", ROUTE_PATHS.tales, updated.id]);
      },
      error: (err) => {
        console.log("Error updating tale:", err);
        this.openToast("Could not update tale. Please try again.");
      }
    });
  }

  protected openArchiveDialog(): void {
    if (this.inProgress() || this.archiveInProgress()) {
      return;
    }
    this.archiveNameValue.set("");
    this.archiveDialogOpen.set(true);
  }

  protected closeArchiveDialog(force: boolean = false): void {
    if (!force && this.archiveInProgress()) {
      return;
    }
    this.archiveDialogOpen.set(false);
    this.archiveNameValue.set("");
  }

  protected onArchiveNameChange(value: string): void {
    this.archiveNameValue.set(value);
  }

  protected closeRuleChangeDialog(): void {
    this.ruleChangeDialogOpen.set(false);
    this.pendingRuleSystem.set(null);
    this.ruleChangeNameValue.set("");
  }

  protected onRuleChangeNameChange(value: string): void {
    this.ruleChangeNameValue.set(value);
  }

  protected confirmRuleChange(): void {
    const nextRule = this.pendingRuleSystem();
    if (!nextRule || !this.canConfirmRuleChange()) {
      return;
    }
    this.controls.ruleSystem.setValue(nextRule);
    this.controls.ruleSystem.markAsDirty();
    this.closeRuleChangeDialog();
  }

  protected confirmArchive(): void {
    if (!this.canConfirmArchive() || this.archiveInProgress()) {
      return;
    }

    const tale = this.tale();
    if (!tale) {
      return;
    }

    this.archiveInProgress.set(true);
    this._taleService.archiveTale(tale.id).pipe(
      finalize(() => this.archiveInProgress.set(false))
    ).subscribe({
      next: () => {
        this.closeArchiveDialog(true);
        void this._router.navigate(["/"]);
      },
      error: (err) => {
        console.log("Error archiving tale:", err);
        this.openToast(this._translateService.instant("TALE_ARCHIVE_FAILED"));
      }
    });
  }

  public ngOnDestroy(): void {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = null;
    }
  }

  protected hasChanges(): boolean {
    if (!this.initialState) return false;
    if (this.controls.taleName.value !== this.initialState.taleName) return true;
    if (this.controls.description.value !== this.initialState.description) return true;
    if (this.controls.language.value !== this.initialState.language) return true;
    if (this.controls.isPublic.value !== this.initialState.isPublic) return true;
    if (this.controls.ruleSystem.value !== this.initialState.rules) return true;
    if (this.controls.image.value) return true;
    return this.removeImage();
  }

  private applyTaleToForm(tale: TaleDetailDTO): void {
    this.editTaleFormGroup.patchValue({
      taleName: tale.taleName,
      description: tale.description,
      language: tale.language,
      isPublic: tale.isPublic,
      ruleSystem: tale.rules
    }, {emitEvent: false});
    this.editTaleFormGroup.markAsPristine();
    this.editTaleFormGroup.markAsUntouched();
    this.initialState = {
      taleName: tale.taleName,
      description: tale.description,
      language: tale.language,
      isPublic: tale.isPublic,
      rules: tale.rules,
      hasImage: !!tale.imageUrl
    };
  }

  private resetImageCrop(): void {
    this.imageCropOpen.set(false);
    this.imageCropFile.set(undefined);
    this.imageCropBlob.set(null);
  }

  private setImagePreview(file: File | null): void {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = null;
    }
    if (!file) {
      this.imagePreview.set(null);
      return;
    }
    const url = URL.createObjectURL(file);
    this.imagePreviewUrl = url;
    this.imagePreview.set(url);
  }

  private openToast(message: string, variant: EVariant = EVariant.DANGER): void {
    this._toastService.show({
      label: this._translateService.instant("ERROR"),
      message,
      variant
    });
  }
}
