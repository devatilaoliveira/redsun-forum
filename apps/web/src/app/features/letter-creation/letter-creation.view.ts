import {Component, computed, inject, signal, Signal, WritableSignal} from "@angular/core";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {finalize} from "rxjs";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsTextarea} from "../../shared/fragments/rsTextarea/rs.textarea";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {UTIL_CONSTANTS} from "../../../interface/constants/util.constants";
import {ILetterService, LetterService} from "../../../services/letter.service";
import {LetterCreateRequestDTO} from "../../../interface/dtos/letter/LetterCreateRequestDTO";
import {RsContactsMultiSelect} from "../../shared/fragments/rsContactsMultiSelect/rs.contacts-multi-select";
import {LocalStoreService} from "../../../services/local-store.service";
import {UserAsContactDTO} from "../../../interface/dtos/user/UserAsContactDTO";
import {EVariant} from "../../../interface/enums/EVariant";
import {IToastService, ToastService} from "../../../services/toast.service";
import {ROUTE_PATHS} from "../../../interface/constants/route-path.constants";

type LetterFormGroup = FormGroup<{
  to: FormControl<string>;
  recipientsIds: FormControl<string[]>;
  subject: FormControl<string>;
  content: FormControl<string>;
}>;

@Component({
  selector: "rs-letter-creation",
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, RsInput, RsTextarea, RsButton, RsViewHeader, RsContactsMultiSelect],
  templateUrl: "./letter-creation.view.html",
  styleUrl: "./letter-creation.view.scss"
})
export class LetterCreationView {
  private readonly _fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _letterService: ILetterService = inject(LetterService);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _toastService: IToastService = inject(ToastService);
  private readonly _localStoreService: LocalStoreService = inject(LocalStoreService);

  protected readonly UTIL_CONSTANTS = UTIL_CONSTANTS;
  protected readonly subjectMaxLength = 200;
  protected readonly contactId: string | null = this._route.snapshot.paramMap.get(ROUTE_PATHS.contactId);
  protected readonly hasContactId: Signal<boolean> = computed(() => !!this.contactId);
  protected readonly myContacts: Signal<UserAsContactDTO[]> = computed(() => this._localStoreService.user()?.contacts ?? []);
  protected readonly letterFormGroup: LetterFormGroup = this._fb.group({
    to: this._fb.control<string>(this.contactId ?? ""),
    recipientsIds: this._fb.control<string[]>(
      this.contactId ? [this.contactId] : [],
      {validators: [Validators.required]}
    ),
    subject: this._fb.control<string>("", {validators: [Validators.required, Validators.maxLength(this.subjectMaxLength)]}),
    content: this._fb.control<string>("", {validators: [Validators.required, Validators.maxLength(UTIL_CONSTANTS.EXTRA_LONG_TEXT_LENGTH)]})
  });
  protected readonly letterControls = this.letterFormGroup.controls;
  protected readonly inProgress: WritableSignal<boolean> = signal(false);

  protected onSubjectChange(value: string): void {
    this.letterControls.subject.setValue(value);
    this.letterControls.subject.markAsDirty();
  }

  protected onContentChange(value: string): void {
    this.letterControls.content.setValue(value);
    this.letterControls.content.markAsDirty();
  }

  protected onRecipientsChange(value: string[]): void {
    this.letterControls.recipientsIds.setValue(value);
    this.letterControls.recipientsIds.markAsDirty();
  }

  protected onSubmit(): void {
    this.letterFormGroup.markAllAsTouched();
    if (this.letterFormGroup.invalid || this.inProgress()) {
      return;
    }

    const recipients: string[] = this.letterControls.recipientsIds.value ?? [];
    if (recipients.length === 0) {
      return;
    }

    this.inProgress.set(true);
    const payload: LetterCreateRequestDTO = {
      recipientsIds: recipients,
      subject: this.letterControls.subject.value.trim(),
      content: this.letterControls.content.value.trim()
    };

    this._letterService.createLetter(payload).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: () => {
        this.letterFormGroup.reset({
          to: this.contactId ?? "",
          recipientsIds: this.contactId ? [this.contactId] : [],
          subject: "",
          content: ""
        });
        this.openToast("LETTER_CREATE_SUCCESS");
      },
      error: () => {
        this.openToast("LETTER_CREATE_ERROR");
      }
    });
  }

  private openToast(messageKey: string): void {
    const isSuccess = messageKey === "LETTER_CREATE_SUCCESS";
    this._toastService.show({
      label: this._translateService.instant(isSuccess ? "SUCCESS" : "ERROR"),
      message: this._translateService.instant(messageKey),
      variant: isSuccess ? EVariant.SUCCESS : EVariant.DANGER
    });
  }
}
