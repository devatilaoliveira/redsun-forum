import {Component, input, InputSignal} from "@angular/core";
import {EVariant} from "../../../../interface/enums/EVariant";
import {ETheme} from "../../../../interface/enums/ETheme";

@Component({
  selector: "rs-dot",
  standalone: true,
  templateUrl: "./rs.dot.html",
  styleUrl: "./rs.dot.scss",
  host: {
    "aria-hidden": "true"
  }
})
export class RsDot {
  public readonly active: InputSignal<boolean> = input<boolean>(false);
  public readonly theme: InputSignal<ETheme> = input<ETheme>(ETheme.DARK);
  public readonly variant: InputSignal<EVariant | null> = input<EVariant | null>(null);
}
