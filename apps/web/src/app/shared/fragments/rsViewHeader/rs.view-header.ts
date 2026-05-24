import {Component, input, InputSignal} from "@angular/core";

@Component({
  selector: "rs-view-header",
  standalone: true,
  imports: [ ],
  templateUrl: "./rs.view-header.html",
  styleUrl: "./rs.view-header.scss"
})
export class RsViewHeader {
  public readonly title: InputSignal<string> = input.required<string>();
  public readonly subTittle: InputSignal<string | undefined> = input<string | undefined>();
}