import {Component, computed, inject, OnDestroy, signal, Signal, WritableSignal} from "@angular/core";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsTextarea} from "../../shared/fragments/rsTextarea/rs.textarea";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsCheckbox} from "../../shared/fragments/rsCheckbox/rs.checkbox";
import {RsSelect} from "../../shared/fragments/rsSelect/rs.select";
import {RsImagePreview} from "../../shared/fragments/rsImagePreview/rs.image-preview";
import {RsContactsMultiSelect} from "../../shared/fragments/rsContactsMultiSelect/rs.contacts-multi-select";
import {ERuleSystem} from "../../../interface/enums/ERuleSystem";
import {ITaleService, TaleService} from "../../../services/tale.service";
import {Router} from "@angular/router";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {finalize} from "rxjs";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {UTIL_CONSTANTS} from "../../../interface/constants/util.constants";
import {TaleCreateRequestDTO} from "../../../interface/dtos/tale/TaleCreateRequestDTO";
import {LocalStoreService} from "../../../services/local-store.service";
import {UserAsContactDTO} from "../../../interface/dtos/user/UserAsContactDTO";
import {ImageHandler} from "../../../infra/miscellaneous/image.handler";
import {EVariant} from "../../../interface/enums/EVariant";
import {IToastService, ToastService} from "../../../services/toast.service";
import {RsImageCropDialogComponent} from "../../shared/ui/image-crop-dialog/image-crop-dialog.component";
import {ELanguage} from "../../../interface/enums/ELanguage";

type CreateTaleFormGroup = FormGroup<{
  taleName: FormControl<string>;
  description: FormControl<string>;
  language: FormControl<ELanguage | null>;
  isPublic: FormControl<boolean>;
  ruleSystem: FormControl<ERuleSystem>;
  image: FormControl<File | null>;
}>;

@Component({
  selector: "rs-tale-creation",
  standalone: true,
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    RsInput,
    RsTextarea,
    RsButton,
    RsCheckbox,
    RsSelect,
    RsImagePreview,
    RsContactsMultiSelect,
    RsViewHeader,
    RsImageCropDialogComponent
  ],
  templateUrl: "./tale-creation.view.html",
  styleUrl: "./tale-creation.view.scss"
})
export class TaleCreationView implements OnDestroy {
  private readonly _fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly _taleService: ITaleService = inject(TaleService);
  private readonly _router: Router = inject(Router);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _localStoreService: LocalStoreService = inject(LocalStoreService);
  private readonly _toastService: IToastService = inject(ToastService);
  private imagePreviewUrl: string | null = null;

  protected readonly UTIL_CONSTANTS = UTIL_CONSTANTS;
  protected readonly createNewTaleFormGroup: CreateTaleFormGroup = this._fb.group({
    taleName: this._fb.control<string>("", {validators: [Validators.required, Validators.maxLength(UTIL_CONSTANTS.EXTRA_SHORT_TEXT_LENGTH)]}),
    description: this._fb.control<string>("", {validators: [Validators.required, Validators.maxLength(UTIL_CONSTANTS.EXTRA_LONG_TEXT_LENGTH)]}),
    language: new FormControl<ELanguage | null>(null),
    isPublic: this._fb.control<boolean>(true),
    ruleSystem: this._fb.control<ERuleSystem>(ERuleSystem.DND_5E, {validators: [Validators.required]}),
    image: new FormControl<File | null>(null)
  });
  protected readonly taleFormControls = this.createNewTaleFormGroup.controls;
  protected readonly inProgress: WritableSignal<boolean> = signal(false);
  protected readonly selectedContactIds: WritableSignal<string[]> = signal<string[]>([]);
  protected readonly myContacts: Signal<UserAsContactDTO[]> = computed(() => this._localStoreService.user()?.contacts ?? []);
  protected readonly imageCropOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly imageCropFile: WritableSignal<File | undefined> = signal<File | undefined>(undefined);
  protected readonly imageCropBlob: WritableSignal<Blob | null> = signal<Blob | null>(null);
  protected readonly cropProcessing: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly imagePreview: WritableSignal<string | null> = signal<string | null>(null);

  protected readonly ERuleSystem = ERuleSystem;
  protected readonly ELanguage = ELanguage;
  protected readonly EVariant = EVariant;

  protected readonly taleNamePattern: RegExp = new RegExp(`^.{1,${UTIL_CONSTANTS.EXTRA_SHORT_TEXT_LENGTH}}$`);

  protected onNameChange(value: string): void {
    this.taleFormControls.taleName.setValue(value);
    this.taleFormControls.taleName.markAsDirty();
  }

  protected onDescriptionChange(value: string): void {
    this.taleFormControls.description.setValue(value);
    this.taleFormControls.description.markAsDirty();
  }

  protected onLanguageChange(value: string | null): void {
    this.taleFormControls.language.setValue(this.toLanguage(value));
    this.taleFormControls.language.markAsDirty();
  }

  protected onRuleSystemChange(value: string | null): void {
    const nextValue: ERuleSystem = value ? (value as ERuleSystem) : ERuleSystem.DND_5E;
    this.taleFormControls.ruleSystem.setValue(nextValue);
    this.taleFormControls.ruleSystem.markAsDirty();
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
    this.taleFormControls.image.setValue(null);
    this.taleFormControls.image.markAsDirty();
    this.setImagePreview(null);
  }

  protected onImageCropped(blob: Blob | null): void {
    this.imageCropBlob.set(blob);
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
      this.taleFormControls.image.setValue(processed);
      this.taleFormControls.image.markAsDirty();
      this.setImagePreview(processed);
      this.resetImageCrop();
    } catch (err) {
      console.log("Error cropping tale image:", err);
    } finally {
      this.cropProcessing.set(false);
    }
  }

  protected onPublicToggle(checked: boolean): void {
    this.taleFormControls.isPublic.setValue(checked);
    this.taleFormControls.isPublic.markAsDirty();
  }

  protected onContactsChange(value: string[]): void {
    this.selectedContactIds.set(value);
  }

  protected onSubmit(): void {
    this.createNewTaleFormGroup.markAllAsTouched();
    if (this.createNewTaleFormGroup.invalid || this.inProgress()) {
      return;
    }
    this.inProgress.set(true);
    const payload: TaleCreateRequestDTO = {
      taleName: this.taleFormControls.taleName.value,
      participantsIds: this.selectedContactIds(),
      isPublic: this.taleFormControls.isPublic.value,
      description: this.taleFormControls.description.value,
      language: this.taleFormControls.language.value,
      rules: this.taleFormControls.ruleSystem.value,
      image: this.taleFormControls.image.value
    };

    this._taleService.createTale(payload).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: (response) => {
        void this._router.navigate(["/", ROUTE_PATHS.tales, response.id]);
      },
      error: (e) => {
        console.log("Error creating tale:", e);
        this.openToast(this._translateService.instant("TALE_CREATE_ERROR"));
      }
    });
  }

  public ngOnDestroy(): void {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
      this.imagePreviewUrl = null;
    }
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

  private toLanguage(value: string | null): ELanguage | null {
    if (!value) return null;
    return Object.values(ELanguage).includes(value as ELanguage) ? value as ELanguage : null;
  }
}
