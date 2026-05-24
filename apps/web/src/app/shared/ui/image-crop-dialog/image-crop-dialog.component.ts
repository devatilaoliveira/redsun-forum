import {Component, input, InputSignal, output, OutputEmitterRef} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";
import {ImageCropperComponent, ImageCroppedEvent} from "ngx-image-cropper";
import {UTIL_CONSTANTS} from "../../../../interface/constants/util.constants";
import {EVariant} from "../../../../interface/enums/EVariant";
import {RsDialogModalComponent} from "../dialog-modal/dialog-modal.component";

@Component({
  selector: "rs-image-crop-dialog",
  standalone: true,
  imports: [
    TranslatePipe,
    RsDialogModalComponent,
    ImageCropperComponent
  ],
  templateUrl: "./image-crop-dialog.component.html",
  styleUrl: "./image-crop-dialog.component.scss"
})
export class RsImageCropDialogComponent {
  public readonly imageFile: InputSignal<File | undefined> = input<File | undefined>(undefined);
  public readonly cropProcessing: InputSignal<boolean> = input<boolean>(false);
  public readonly saveDisabled: InputSignal<boolean> = input<boolean>(false);

  public readonly cropped: OutputEmitterRef<Blob | null> = output<Blob | null>();
  public readonly closed: OutputEmitterRef<void> = output<void>();
  public readonly confirmed: OutputEmitterRef<void> = output<void>();

  protected onImageCropped(event: ImageCroppedEvent): void {
    this.cropped.emit(event.blob ?? null);
  }

  protected onClose(): void {
    this.closed.emit();
  }

  protected onConfirm(): void {
    this.confirmed.emit();
  }

  protected readonly EVariant = EVariant;
  protected readonly UTIL_CONSTANTS = UTIL_CONSTANTS;
}
