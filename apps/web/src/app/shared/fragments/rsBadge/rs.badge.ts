import {Component, input, InputSignal} from "@angular/core";
import {EVariant} from "../../../../interface/enums/EVariant";

@Component({
  selector: "rs-badge",
  standalone: true,
  templateUrl: "./rs.badge.html",
  styleUrl: "./rs.badge.scss"
})
export class RsBadge {
  public readonly label: InputSignal<string> = input.required<string>();
  public readonly variant: InputSignal<EVariant> = input<EVariant>(EVariant.PRIMARY);
}
