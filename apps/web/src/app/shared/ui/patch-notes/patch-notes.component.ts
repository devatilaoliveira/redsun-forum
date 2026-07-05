import {Component, input, InputSignal} from "@angular/core";
import {RsDivider} from "../../fragments/rsDivider/rs.divider";

export interface PatchNoteItem {
  readonly title: string;
  readonly description: string;
}

export interface PatchNoteGroup {
  readonly title: string;
  readonly date: string;
  readonly summary: string;
  readonly items: readonly PatchNoteItem[];
}

@Component({
  selector: "rs-patch-notes",
  standalone: true,
  imports: [RsDivider],
  templateUrl: "./patch-notes.component.html",
  styleUrl: "./patch-notes.component.scss"
})
export class PatchNotesComponent {
  public readonly title: InputSignal<string> = input.required<string>();
  public readonly groups: InputSignal<readonly PatchNoteGroup[]> = input.required<readonly PatchNoteGroup[]>();
}
