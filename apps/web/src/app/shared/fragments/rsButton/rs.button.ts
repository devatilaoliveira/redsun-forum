import {Component, input, InputSignal, output, OutputEmitterRef} from "@angular/core";
import {EVariant} from "../../../../interface/enums/EVariant";
import {ESize} from "../../../../interface/enums/ESize";
import {RsSpinner} from "../rsSpinner/rs.spinner";
import {NgStyle} from "@angular/common";
import {IStyleMap} from "../../../../interface/models/istyle-map";

@Component({
  selector: "rs-button",
  standalone: true,
  imports: [RsSpinner, NgStyle],
  templateUrl: "./rs.button.html",
  styleUrl: "./rs.button.scss"
})
export class RsButton {
  public readonly type: InputSignal<"button" | "submit" | "reset"> = input<"button" | "submit" | "reset">("button");
  public readonly form: InputSignal<string | null> = input<string | null>(null);
  public readonly testId: InputSignal<string | null> = input<string | null>(null);
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly inProgress: InputSignal<boolean> = input<boolean>(false);
  public readonly variant: InputSignal<EVariant> = input<EVariant>(EVariant.PRIMARY);
  public readonly size: InputSignal<ESize> = input<ESize>(ESize.M);
  public readonly pressed: OutputEmitterRef<void> = output<void>();
  public readonly customStyle: InputSignal<IStyleMap | null> = input<IStyleMap | null>(null);

  protected onClick(): void {
    if (this.disabled() || this.inProgress()) return;
    this.pressed.emit();
  }

  protected readonly EVariant = EVariant;
}
