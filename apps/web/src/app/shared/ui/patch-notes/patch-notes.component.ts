import {Component, inject, input, InputSignal} from "@angular/core";
import {ITimeDisplayHandler, TimeDisplayHandler} from "../../../../infra/miscellaneous/time-display.handler";
import {RsDivider} from "../../fragments/rsDivider/rs.divider";
import {PatchNoteDTO} from "../../../../interface/dtos/patchNote/PatchNoteDTO";

@Component({
  selector: "rs-patch-notes",
  standalone: true,
  imports: [RsDivider],
  templateUrl: "./patch-notes.component.html",
  styleUrl: "./patch-notes.component.scss"
})
export class PatchNotesComponent {
  private readonly _timeDisplayHandler: ITimeDisplayHandler = inject(TimeDisplayHandler);

  public readonly title: InputSignal<string> = input.required<string>();
  public readonly groups: InputSignal<readonly PatchNoteDTO[]> = input.required<readonly PatchNoteDTO[]>();

  protected patchDateDisplay(date: string): string {
    return this._timeDisplayHandler.display(date, "date");
  }
}
