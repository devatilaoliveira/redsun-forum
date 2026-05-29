import {Component, input, InputSignal} from "@angular/core";
import {ETheme} from "../../../../interface/enums/ETheme";

export type DividerType = "gradient" | "solid";

@Component({
  selector: "rs-divider",
  standalone: true,
  templateUrl: "./rs.divider.html",
  styleUrl: "./rs.divider.scss"
})
export class RsDivider {
  public readonly type: InputSignal<DividerType | null> = input<DividerType | null>(null);
  public readonly theme: InputSignal<ETheme> = input<ETheme>(ETheme.DARK);
}
