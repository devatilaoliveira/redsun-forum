import {Component, Input} from "@angular/core";

@Component({
  selector: "rs-title",
  imports: [],
  templateUrl: "./redsun.title.html",
  styleUrl: "./redsun.title.scss"
})
export class RedsunTitle {
  @Input() public fontSize: string | null = null;

}
