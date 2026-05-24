import {Component, inject, Signal} from "@angular/core";
import {RsToastComponent} from "./toast.component";
import {IToastService, ToastMessage, ToastService} from "../../../../services/toast.service";

@Component({
  selector: "rs-toast-host",
  standalone: true,
  imports: [RsToastComponent],
  templateUrl: "./toast-host.component.html",
  styleUrl: "./toast-host.component.scss"
})
export class RsToastHostComponent {
  private readonly _toastService: IToastService = inject(ToastService);

  protected readonly toast: Signal<ToastMessage | null> = this._toastService.toast;

  protected dismiss(id: number): void {
    this._toastService.dismiss(id);
  }
}
