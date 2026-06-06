import {Component, DestroyRef, effect, inject, Signal, signal, WritableSignal, computed} from "@angular/core";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MeResponseDTO} from "../../../interface/dtos/user/MeResponseDTO";
import {LocalStoreService} from "../../../services/local-store.service";
import {UTIL_CONSTANTS} from "../../../interface/constants/util.constants";
import {IUserProfileService, UserProfileService} from "../../../services/user-profile.service";
import {IPrinter, Printer} from "../../../infra/miscellaneous/printer.handler";
import {RsAvatar} from "../../shared/fragments/rsAvatar/rs.avatar";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {EVariant} from "../../../interface/enums/EVariant";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {MeRequestDTO} from "../../../interface/dtos/user/MeRequestDTO";
import {RsTextarea} from "../../shared/fragments/rsTextarea/rs.textarea";
import {USER_NAME_PATTERN} from "../../../interface/constants/pattern-validators";
import {HttpErrorResponse} from "@angular/common/http";
import {RsDialogModalComponent} from "../../shared/ui/dialog-modal/dialog-modal.component";
import {AuthService, IAuthService} from "../../../services/auth.service";
import {Router} from "@angular/router";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";
import {finalize} from "rxjs";
import {ImageCropperComponent, ImageCroppedEvent} from "ngx-image-cropper";
import {ImageHandler} from "../../../infra/miscellaneous/image.handler";
import {IToastService, ToastService} from "../../../services/toast.service";
import {RsCheckbox} from "../../shared/fragments/rsCheckbox/rs.checkbox";
import {EProfileLanguage} from "../../../interface/enums/EProfileLanguage";
import {ERuleSystem} from "../../../interface/enums/ERuleSystem";
import {ERole} from "../../../interface/enums/ERole";
import {EProvider} from "../../../interface/enums/EProvider";

type ProfileDetailsFormGroup = FormGroup<{
  username: FormControl<string>;
  description: FormControl<string>;
  favoriteLanguage: FormControl<EProfileLanguage[]>;
  favoriteRules: FormControl<ERuleSystem[]>;
  favoriteRole: FormControl<ERole[]>;
}>;

const USER_PREFERENCE_MAX_ITEMS = 10;

@Component({
  selector: "rs-profile-details",
  standalone: true,
  imports: [
    RsAvatar,
    ReactiveFormsModule,
    RsButton,
    RsInput,
    RsTextarea,
    TranslatePipe,
    RsDialogModalComponent,
    ImageCropperComponent,
    RsCheckbox
  ],
  templateUrl: "./profile-details.view.html",
  styleUrl: "./profile-details.view.scss"
})
export class ProfileDetailsView {
  private readonly _localStoreService: LocalStoreService = inject(LocalStoreService);
  private readonly _formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly _userProfileService: IUserProfileService = inject(UserProfileService);
  private readonly _printer: IPrinter = inject(Printer);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _toastService: IToastService = inject(ToastService);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _authService: IAuthService = inject(AuthService);
  private readonly _router: Router = inject(Router);

  protected readonly EProvider = EProvider;
  protected readonly authenticatedUser: Signal<MeResponseDTO | null> = this._localStoreService.user;
  protected readonly isEditMode: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly hasChanges: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly isSaving: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly usernamePattern: RegExp = USER_NAME_PATTERN;
  protected readonly deleteDialogOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly deleteUsernameValue: WritableSignal<string> = signal<string>("");
  protected readonly deleteInProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly canConfirmDelete = computed<boolean>(() => {
    const user = this.authenticatedUser();
    const typed = this.deleteUsernameValue().trim();
    return !!user && typed.length > 0 && typed === user.username;
  });
  protected readonly avatarCropOpen: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly avatarCropFile: WritableSignal<File | undefined> = signal<File | undefined>(undefined);
  protected readonly avatarCropBlob: WritableSignal<Blob | null> = signal<Blob | null>(null);
  protected readonly avatarUploading: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly profileLanguageOptions: EProfileLanguage[] = Object.values(EProfileLanguage);
  protected readonly ruleSystemOptions: ERuleSystem[] = Object.values(ERuleSystem);
  protected readonly roleOptions: ERole[] = Object.values(ERole);
  protected readonly profileFormGroup: ProfileDetailsFormGroup = this._formBuilder.group({
    username: this._formBuilder.control<string>("", {validators: [
      Validators.required,
      Validators.minLength(UTIL_CONSTANTS.MIN_LENGTH),
      Validators.maxLength(UTIL_CONSTANTS.USERNAME_MAX_LENGTH),
      Validators.pattern(this.usernamePattern)
    ]}),
    description: this._formBuilder.control<string>("", {validators: [Validators.maxLength(UTIL_CONSTANTS.EXTRA_LONG_TEXT_LENGTH)]}),
    favoriteLanguage: this._formBuilder.control<EProfileLanguage[]>([], {validators: [Validators.maxLength(USER_PREFERENCE_MAX_ITEMS)]}),
    favoriteRules: this._formBuilder.control<ERuleSystem[]>([], {validators: [Validators.maxLength(USER_PREFERENCE_MAX_ITEMS)]}),
    favoriteRole: this._formBuilder.control<ERole[]>([], {validators: [Validators.maxLength(USER_PREFERENCE_MAX_ITEMS)]})
  });
  protected readonly controls = this.profileFormGroup.controls;
  protected readonly EVariant = EVariant;
  protected readonly UTIL_CONSTANTS = UTIL_CONSTANTS;
  private initialSnapshot: string = this.snapshotForm();

  constructor() {
    this.profileFormGroup.disable({emitEvent: false});

    effect(() => {
      if (this.isSaving()) {
        return;
      }
      if (this.isEditMode()) {
        return;
      }
      const user = this.authenticatedUser();
      if (!user) {
        return;
      }

      this.profileFormGroup.patchValue({
        username: user.username,
        description: user.description ?? "",
        favoriteLanguage: user.favoriteLanguage ?? [],
        favoriteRules: user.favoriteRules ?? [],
        favoriteRole: user.favoriteRole ?? []
      }, {emitEvent: false});
      if (!this.isEditMode()) {
        this.profileFormGroup.disable({emitEvent: false});
        this.initialSnapshot = this.snapshotForm();
        this.hasChanges.set(false);
      }
    });

    this.profileFormGroup.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        if (!this.isEditMode()) {
          return;
        }
        this.hasChanges.set(this.snapshotForm() !== this.initialSnapshot);
      });
  }

  protected onAvatarFilePicked(file: File): void {
    if (this.avatarUploading()) {
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
    const blob = this.avatarCropBlob();
    if (!blob) {
      return;
    }

    this.avatarUploading.set(true);
    try {
      const sourceName = this.avatarCropFile()?.name ?? "avatar.jpg";
      const croppedFile = new File([blob], sourceName, {type: blob.type || "image/jpeg"});
      const processed = await ImageHandler.resizeAndCompress(croppedFile);
      const formData = new FormData();
      formData.append(UTIL_CONSTANTS.FILE, processed);

      this._userProfileService.saveAvatar(formData)
        .pipe(finalize(() => {
          this.avatarUploading.set(false);
          this.closeAvatarCrop();
        }))
        .subscribe({
          next: (me) => {
            this._localStoreService.storeUser(me);
          },
          error: (err) => {
            this._printer.error("avatar upload failed", err);
            this.openToast("AVATAR_UPDATE_FAILED");
          }
        });
    } catch (err) {
      this.avatarUploading.set(false);
      this._printer.error("avatar crop failed", err);
      this.openToast("AVATAR_UPDATE_FAILED");
    }
  }

  private openToast(messageKey: string): void {
    this._toastService.show({
      label: this._translateService.instant("ERROR"),
      message: this._translateService.instant(messageKey),
      variant: EVariant.DANGER
    });
  }

  protected onAvatarRemoved(me: MeResponseDTO): void {
    this._localStoreService.storeUser(me);
  }

  protected onUsernameChange(value: string): void {
    this.controls.username.setValue(value);
    this.controls.username.markAsDirty();
  }

  protected onDescriptionChange(value: string): void {
    this.controls.description.setValue(value);
    this.controls.description.markAsDirty();
  }

  protected onFavoriteLanguageToggle(value: EProfileLanguage, checked: boolean): void {
    this.updateArrayControl(this.controls.favoriteLanguage, value, checked);
  }

  protected onFavoriteRulesToggle(value: ERuleSystem, checked: boolean): void {
    this.updateArrayControl(this.controls.favoriteRules, value, checked);
  }

  protected onFavoriteRoleToggle(value: ERole, checked: boolean): void {
    this.updateArrayControl(this.controls.favoriteRole, value, checked);
  }

  protected isSelected<T>(selected: readonly T[], value: T): boolean {
    return selected.includes(value);
  }

  protected onToggleEdit(): void {
    if (this.isSaving()) {
      return;
    }
    if (!this.isEditMode()) {
      this.enterEditMode();
      return;
    }

    if (this.hasChanges()) {
      this.saveProfile();
      return;
    }
    this.exitEditMode();
  }

  protected saveProfile(): void {
    this.profileFormGroup.markAllAsTouched();
    if (this.profileFormGroup.invalid || !this.hasChanges() || this.isSaving()) {
      return;
    }

    const payload: MeRequestDTO = {
      username: this.controls.username.value.trim(),
      description: this.controls.description.value,
      favoriteLanguage: this.controls.favoriteLanguage.value,
      favoriteRules: this.controls.favoriteRules.value,
      favoriteRole: this.controls.favoriteRole.value
    };

    this.isSaving.set(true);
    this._userProfileService.updateMe(payload).subscribe({
      next: (me) => {
        this._localStoreService.storeUser(me);
        this.isSaving.set(false);
        this.exitEditMode();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.openToast("USERNAME_TAKEN");
        } else {
          this._printer.error("profile update failed", err);
        }
        this.isSaving.set(false);
      }
    });
  }

  protected openDeleteDialog(): void {
    if (this.isSaving()) {
      return;
    }
    this.deleteUsernameValue.set("");
    this.deleteDialogOpen.set(true);
  }

  protected closeDeleteDialog(force: boolean = false): void {
    if (!force && this.deleteInProgress()) {
      return;
    }
    this.deleteDialogOpen.set(false);
  }

  protected onDeleteUsernameChange(value: string): void {
    this.deleteUsernameValue.set(value);
  }

  protected navigateToChangePassword(): void {
    void this._router.navigate(["/", ROUTE_PATHS.changePassword]);
  }

  protected confirmDeleteAccount(): void {
    if (this.deleteInProgress() || !this.canConfirmDelete()) {
      return;
    }

    this.deleteInProgress.set(true);
    this._userProfileService.deleteMe().pipe(
      finalize(() => this.deleteInProgress.set(false))
    ).subscribe({
      next: (deleted) => {
        if (!deleted) {
          this._printer.error("account deletion failed", new Error("delete endpoint returned false"));
          return;
        }
        this.closeDeleteDialog(true);
        void this._authService.logout().then(() => {
          void this._router.navigate(["/", ROUTE_PATHS.login]);
        });
      },
      error: (err) => {
        this._printer.error("account deletion failed", err);
      }
    });
  }

  private enterEditMode(): void {
    this.isEditMode.set(true);
    this.profileFormGroup.enable({emitEvent: false});
    this.profileFormGroup.markAsPristine();
    this.initialSnapshot = this.snapshotForm();
    this.hasChanges.set(false);
  }

  private exitEditMode(): void {
    this.isEditMode.set(false);
    this.profileFormGroup.disable({emitEvent: false});
    this.hasChanges.set(false);
  }

  private snapshotForm(): string {
    return JSON.stringify(this.profileFormGroup.getRawValue());
  }

  private updateArrayControl<T>(control: FormControl<T[]>, value: T, checked: boolean): void {
    const current = control.value;
    const next = checked
      ? Array.from(new Set([...current, value]))
      : current.filter((item) => item !== value);
    control.setValue(next);
    control.markAsDirty();
  }
}
