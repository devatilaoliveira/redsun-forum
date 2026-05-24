import {Component, input, InputSignal, inject} from "@angular/core";
import {Router} from "@angular/router";
import {ROUTE_PATHS} from "../../../../interface/constants/route-path.constants";
import {RsAvatar} from "../rsAvatar/rs.avatar";

@Component({
  selector: "rs-contact-card",
  standalone: true,
  imports: [RsAvatar],
  templateUrl: "./rs.contact-card.html",
  styleUrl: "./rs.contact-card.scss"
})
export class RsContactCard {
  private readonly _router: Router = inject(Router);

  public readonly profileId: InputSignal<string> = input.required<string>();
  public readonly displayName: InputSignal<string> = input.required<string>();
  public readonly avatarSrc: InputSignal<string | null> = input<string | null>(null);
  public readonly avatarSize: InputSignal<number> = input<number>(72);
  public readonly clickable: InputSignal<boolean> = input<boolean>(true);
  public readonly hideLabel: InputSignal<boolean> = input<boolean>(false);

  protected onContactPressed(): void {
    const contactId = this.profileId();
    if (!this.clickable() || !contactId) {
      return;
    }
    void this._router.navigate(["/", ROUTE_PATHS.contacts, ROUTE_PATHS.details, contactId]);
  }
}
