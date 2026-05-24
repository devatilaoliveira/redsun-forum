import {Component, inject, signal, WritableSignal} from "@angular/core";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {ITranslateService, TranslatePipe, TranslateService} from "@ngx-translate/core";
import {finalize} from "rxjs";
import {RsButton} from "../../shared/fragments/rsButton/rs.button";
import {RsInput} from "../../shared/fragments/rsInput/rs.input";
import {RsTextarea} from "../../shared/fragments/rsTextarea/rs.textarea";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {IToastService, ToastService} from "../../../services/toast.service";
import {EVariant} from "../../../interface/enums/EVariant";
import {UTIL_CONSTANTS} from "../../../interface/constants/util.constants";
import {ISupportService, SupportService} from "../../../services/support.service";
import {SupportRequestDTO} from "../../../interface/dtos/support/SupportRequestDTO";

type SupportFormGroup = FormGroup<{
  identification: FormControl<string>;
  subject: FormControl<string>;
  message: FormControl<string>;
}>;

@Component({
  selector: "rs-support",
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, RsButton, RsInput, RsTextarea, RsViewHeader],
  templateUrl: "./support.view.html",
  styleUrl: "./support.view.scss"
})
export class SupportView {
  private readonly _fb: NonNullableFormBuilder = inject(NonNullableFormBuilder);
  private readonly _toastService: IToastService = inject(ToastService);
  private readonly _translateService: ITranslateService = inject(TranslateService);
  private readonly _supportService: ISupportService = inject(SupportService);

  protected readonly supportEmail: string = "dev.atila.oliveira@gmail.com";
  protected readonly subjectMaxLength: number = UTIL_CONSTANTS.EXTRA_SHORT_TEXT_LENGTH;
  protected readonly identificationMaxLength: number = UTIL_CONSTANTS.EXTRA_SHORT_TEXT_LENGTH;
  protected readonly messageMaxLength: number = UTIL_CONSTANTS.EXTRA_LONG_TEXT_LENGTH;
  protected readonly subjectPattern: RegExp = new RegExp(`^.{1,${UTIL_CONSTANTS.EXTRA_SHORT_TEXT_LENGTH}}$`);
  protected readonly identificationPattern: RegExp = new RegExp(`^.{1,${UTIL_CONSTANTS.EXTRA_SHORT_TEXT_LENGTH}}$`);
  protected readonly inProgress: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly supportFormGroup: SupportFormGroup = this._fb.group({
    identification: this._fb.control<string>("", {validators: [Validators.required, Validators.pattern(this.identificationPattern)]}),
    subject: this._fb.control<string>("", {validators: [Validators.required, Validators.pattern(this.subjectPattern)]}),
    message: this._fb.control<string>("", {validators: [Validators.required, Validators.maxLength(this.messageMaxLength)]})
  });
  protected readonly controls = this.supportFormGroup.controls;

  protected onIdentificationChange(value: string): void {
    this.controls.identification.setValue(value);
    this.controls.identification.markAsDirty();
  }

  protected onSubjectChange(value: string): void {
    this.controls.subject.setValue(value);
    this.controls.subject.markAsDirty();
  }

  protected onMessageChange(value: string): void {
    this.controls.message.setValue(value);
    this.controls.message.markAsDirty();
  }

  protected onSubmit(): void {
    this.trimControls();
    this.supportFormGroup.markAllAsTouched();
    if (this.supportFormGroup.invalid || this.inProgress()) {
      return;
    }

    const payload: SupportRequestDTO = {
      identification: this.controls.identification.value.trim(),
      subject: this.controls.subject.value.trim(),
      message: this.controls.message.value.trim()
    };

    this.inProgress.set(true);
    this._supportService.sendSupportMessage(payload).pipe(
      finalize(() => this.inProgress.set(false))
    ).subscribe({
      next: () => {
        this.supportFormGroup.reset();
        this._toastService.show({
          label: this._translateService.instant("SUPPORT_TOAST_LABEL"),
          message: this._translateService.instant("SUPPORT_SENT"),
          variant: EVariant.SUCCESS
        });
      },
      error: () => {
        this._toastService.show({
          label: this._translateService.instant("SUPPORT_TOAST_LABEL"),
          message: this._translateService.instant("SUPPORT_FAILED"),
          variant: EVariant.DANGER
        });
      }
    });
  }

  private trimControls(): void {
    this.controls.identification.setValue(this.controls.identification.value.trim());
    this.controls.subject.setValue(this.controls.subject.value.trim());
    this.controls.message.setValue(this.controls.message.value.trim());
  }
}
