import {
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal
} from "@angular/core";
import {NgOptimizedImage, NgTemplateOutlet} from "@angular/common";
import {UTIL_CONSTANTS} from "../../../../interface/constants/util.constants";

@Component({
  selector: "rs-image-preview",
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgTemplateOutlet
  ],
  templateUrl: "./rs.image-preview.html",
  styleUrl: "./rs.image-preview.scss"
})
export class RsImagePreview {
  public readonly src: InputSignal<string | null> = input<string | null>(null);
  public readonly alt: InputSignal<string> = input<string>("Image preview");
  public readonly width: InputSignal<number | null> = input<number | null>(null);
  public readonly height: InputSignal<number | null> = input<number | null>(null);
  public readonly uploadable: InputSignal<boolean> = input<boolean>(false);
  public readonly accept: InputSignal<string> = input<string>("image/png, image/jpeg");

  public readonly fileSelected: OutputEmitterRef<File> = output<File>();
  public readonly imageCleared: OutputEmitterRef<void> = output<void>();

  protected readonly hasPreview: Signal<boolean> = computed<boolean>(() => {
    const url = this.src();
    return !!url && url.trim().length > 0;
  });
  protected readonly frameWidth: Signal<string> = computed<string>(() => {
    const width: number | null = this.width();
    return width != null ? `${width}px` : "100%";
  });

  protected readonly aspectRatio: Signal<string> = computed<string>(() => {
    const width: number | null = this.width();
    const height: number | null = this.height();

    if (width != null && height != null) {
      return `${width} / ${height}`;
    }

    return UTIL_CONSTANTS.DEFAULT_ASPECT_RATIO;
  });

  onFileChange(event: Event): void {
    if (!this.uploadable()) return;
    const inputEl = event.target as HTMLInputElement | null;
    const file: File  | undefined = inputEl?.files?.[0];
    if (!file) return;

    try {
      this.fileSelected.emit(file);
    } finally {
      if (inputEl) inputEl.value = "";
    }
  }

  onClearClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.hasPreview()) return;
    this.imageCleared.emit();
  }
}
