import {Component, input, InputSignal} from "@angular/core";
import {EVariant} from "../../../../interface/enums/EVariant";

@Component({
  selector: "rs-spinner",
  standalone: true,
  templateUrl: "./rs.spinner.html",
  styleUrl: "./rs.spinner.scss"
})
export class RsSpinner {
  public readonly variant: InputSignal<EVariant> = input<EVariant>(EVariant.PRIMARY);
}
