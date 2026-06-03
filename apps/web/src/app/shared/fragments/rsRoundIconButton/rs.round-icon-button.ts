import {Component, input, InputSignal, output, OutputEmitterRef} from "@angular/core";
import {EVariant} from "../../../../interface/enums/EVariant";

export type RsRoundIconButtonVariant = EVariant.PRIMARY | "default";

@Component({
  selector: "rs-round-icon-button",
  standalone: true,
  imports: [],
  templateUrl: "./rs.round-icon-button.html",
  styleUrl: "./rs.round-icon-button.scss"
})
export class RsRoundIconButton {
  public readonly iconSrc: InputSignal<string> = input.required<string>();
  public readonly size: InputSignal<number> = input<number>(24);
  public readonly ariaLabel: InputSignal<string> = input<string>("Icon button");
  public readonly ariaExpanded: InputSignal<boolean | null> = input<boolean | null>(null);
  public readonly ariaControls: InputSignal<string | null> = input<string | null>(null);
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly variant: InputSignal<RsRoundIconButtonVariant> = input<RsRoundIconButtonVariant>("default");
  public readonly pressed: OutputEmitterRef<void> = output<void>();

  protected onClick(): void {
    if (this.disabled()) return;
    this.pressed.emit();
  }
}
