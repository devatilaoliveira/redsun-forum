import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  WritableSignal,
  signal
} from "@angular/core";
import {NgOptimizedImage, NgTemplateOutlet} from "@angular/common";
import {finalize} from "rxjs";
import {MeResponseDTO} from "../../../../interface/dtos/user/MeResponseDTO";
import {UtilFunctions} from "../../../../infra/miscellaneous/util.functions";
import {IUserProfileService, UserProfileService} from "../../../../services/user-profile.service";
import {IPrinter, Printer} from "../../../../infra/miscellaneous/printer.handler";

@Component({
  selector: "rs-avatar",
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgTemplateOutlet
  ],
  templateUrl: "./rs.avatar.html",
  styleUrl: "./rs.avatar.scss"
})
export class RsAvatar {
  public readonly src: InputSignal<string | null> = input<string | null>(null);
  public readonly alt: InputSignal<string> = input<string>("User Avatar");
  public readonly size: InputSignal<number> = input<number>(120);
  public readonly uploadable: InputSignal<boolean> = input<boolean>(false);
  public readonly deletable: InputSignal<boolean> = input<boolean>(true);
  public readonly accept: InputSignal<string> = input<string>("image/png, image/jpeg");
  public readonly userName: InputSignal<string | null> = input<string | null>(null);

  public readonly fileSelected: OutputEmitterRef<File> = output<File>();
  public readonly imageRemoved: OutputEmitterRef<MeResponseDTO> = output<MeResponseDTO>();

  private readonly _userProfileService: IUserProfileService = inject(UserProfileService);
  private readonly _printer: IPrinter = inject(Printer);

  protected readonly hasImage: Signal<boolean> = computed<boolean>(() => {
    const url = this.src();
    return !!url && url.trim().length > 0;
  });
  protected readonly dimension: Signal<string> = computed<string>(() => `${this.size()}px`);
  protected readonly initials: Signal<string> = computed<string>(() =>
    UtilFunctions.getInitials(this.userName())
  );
  protected readonly isDeleting: WritableSignal<boolean> = signal<boolean>(false);

  onFileChange(event: Event): void {
    if (!this.uploadable()) return;
    const inputEl = event.target as HTMLInputElement | null;
    const file = inputEl?.files?.[0];
    if (!file) return;

    try {
      this.fileSelected.emit(file);
    } finally {
      if (inputEl) inputEl.value = "";
    }
  }

  onDeleteAvatar(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.uploadable() || !this.deletable() || !this.hasImage() || this.isDeleting()) return;

    this.isDeleting.set(true);
    this._userProfileService.deleteAvatar()
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: (me: MeResponseDTO) => {
          this.imageRemoved.emit(me);
        },
        error: (err) => {
          this._printer.error("avatar delete failed", err);
        }
      });
  }
}
