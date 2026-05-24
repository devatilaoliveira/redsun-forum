import {Component, inject, OnDestroy, signal, WritableSignal} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsTextarea} from "../../shared/fragments/rsTextarea/rs.textarea";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsImagePreview} from "../../shared/fragments/rsImagePreview/rs.image-preview";
import {finalize} from "rxjs";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {ILocationService, LocationService} from "../../../services/location.service";
import {UTIL_CONSTANTS} from "../../../interface/constants/util.constants";
import {LocationCreateRequestDTO} from "../../../interface/dtos/location/LocationCreateRequestDTO";
import {ImageHandler} from "../../../infra/miscellaneous/image.handler";
import {EVariant} from "../../../interface/enums/EVariant";
import {IToastService, ToastService} from "../../../services/toast.service";
import {TalesContextService} from "../../../stateServices/tales-context.service";
import {RsImageCropDialogComponent} from "../../shared/ui/image-crop-dialog/image-crop-dialog.component";

type CreateLocationFormGroup = FormGroup<{
  locationName: FormControl<string>;
  description: FormControl<string>;
  image: FormControl<File | null>;
}>;

@Component({
  selector: "rs-location-creation",
  standalone: true,
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    RsInput,
    RsTextarea,
    RsButton,
    RsImagePreview,
    RsViewHeader,
    RsImageCropDialogComponent
  ],
  templateUrl: "./location-creation.view.html",
  styleUrl: "./location-creation.view.scss"
})
export class LocationCreationView implements OnDestroy {
  private readonly _fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _locationService: ILocationService = inject(LocationService);
  private readonly _router: Router = inject(Router);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _toastService: IToastService = inject(ToastService);
  private readonly _talesContext: TalesContextService = inject(TalesContextService);
  private imagePreviewUrl: string | null = null;

  protected readonly UTIL_CONSTANTS = UTIL_CONSTANTS;
  protected readonly createNewLocationFormGroup: CreateLocationFormGroup = this._fb.group({
    locationName: this._fb.control<string>("", {validators: [Validators.required, Validators.maxLength(UTIL_CONSTANTS.SHORT_TEXT_LENGTH)]}),
    description: this._fb.control<string>("", {validators: [Validators.required, Validators.maxLength(UTIL_CONSTANTS.LONG_TEXT_LENGTH)]}),
    image: new FormControl<File | null>(null)
  });
  protected readonly locationFormControls = this.createNewLocationFormGroup.controls;
  protected readonly inProgress: WritableSignal<boolean> = signal(false);
  protected readonly imageCropOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly imageCropFile: WritableSignal<File | undefined> = signal<File | undefined>(undefined);
  protected readonly imageCropBlob: WritableSignal<Blob | null> = signal<Blob | null>(null);
  protected readonly cropProcessing: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly imagePreview: WritableSignal<string | null> = signal<string | null>(null);

  protected readonly locationNamePattern: RegExp = new RegExp(`^.{1,${UTIL_CONSTANTS.EXTRA_SHORT_TEXT_LENGTH}}$`);

  protected onNameChange(value: string): void {
    this.locationFormControls.locationName.setValue(value);
    this.locationFormControls.locationName.markAsDirty();
  }

  protected onDescriptionChange(value: string): void {
    this.locationFormControls.description.setValue(value);
    this.locationFormControls.description.markAsDirty();
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
    this.locationFormControls.image.setValue(null);
    this.locationFormControls.image.markAsDirty();
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
      const sourceName = this.imageCropFile()?.name ?? "location-cover.jpg";
      const croppedFile = new File([blob], sourceName, {type: blob.type || "image/jpeg"});
      const processed = await ImageHandler.resizeAndCompress(
        croppedFile,
        UTIL_CONSTANTS.DEFAULT_RESIZE_WIDTH,
        UTIL_CONSTANTS.DEFAULT_RESIZE_HEIGHT
      );
      this.locationFormControls.image.setValue(processed);
      this.locationFormControls.image.markAsDirty();
      this.setImagePreview(processed);
      this.resetImageCrop();
    } catch (err) {
      console.log("Error cropping location image:", err);
    } finally {
      this.cropProcessing.set(false);
    }
  }

  protected onSubmit(): void {
    this.createNewLocationFormGroup.markAllAsTouched();
    if (this.createNewLocationFormGroup.invalid || this.inProgress()) {
      return;
    }
    const taleId = this._route.snapshot.paramMap.get(ROUTE_PATHS.taleId);
    if (!taleId) {
      this.openToast(this._translateService.instant("LOCATION_CREATE_ERROR"));
      return;
    }

    this.inProgress.set(true);
    const payload: LocationCreateRequestDTO = {
      taleId,
      locationName: this.locationFormControls.locationName.value,
      description: this.locationFormControls.description.value,
      image: this.locationFormControls.image.value
    };

    this._locationService.createLocation(payload).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: (response) => {
        this._talesContext.refreshTale();
        void this._router.navigate(
          ["/", ROUTE_PATHS.tales, taleId, ROUTE_PATHS.locations, response.id!],
          {replaceUrl: true}
        );
        return;
      },
      error: (e) => {
        console.log("Error creating location:", e);
        this.openToast(this._translateService.instant("LOCATION_CREATE_ERROR"));
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
      label: variant === EVariant.SUCCESS
        ? this._translateService.instant("SUCCESS")
        : this._translateService.instant("ERROR"),
      message,
      variant
    });
  }

  protected readonly EVariant = EVariant;
}
