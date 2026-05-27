import {Component, input, InputSignal} from "@angular/core";
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
}
