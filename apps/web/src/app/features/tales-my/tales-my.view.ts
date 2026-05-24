import {Component, inject} from "@angular/core";
import {ITaleService, TaleService} from "../../../services/tale.service";
import {TalesGridComponent} from "../../shared/ui/tales-grid/tales-grid.component";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: "rs-tales-my",
  standalone: true,
  imports: [TalesGridComponent, TranslatePipe],
  templateUrl: "./tales-my.view.html",
  styleUrl: "./tales-my.view.scss"
})
export class TalesMyView {
  private readonly _taleService: ITaleService = inject(TaleService);

  protected readonly loadMyTales = (page: number = 0) => this._taleService.getMyTales(page);
}
