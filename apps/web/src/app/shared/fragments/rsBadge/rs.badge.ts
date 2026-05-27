import {Component, input, InputSignal} from "@angular/core";
import {EVariant} from "../../../../interface/enums/EVariant";

@Component({
  selector: "rs-badge",
  standalone: true,
  templateUrl: "./rs.badge.html",
  styleUrl: "./rs.badge.scss"
})
export class RsBadge {
  public readonly label: InputSignal<string | null> = input<string | null>(null);
  public readonly iconSrc: InputSignal<string | null> = input<string | null>(null);
  public readonly variant: InputSignal<EVariant> = input<EVariant>(EVariant.PRIMARY);
}
