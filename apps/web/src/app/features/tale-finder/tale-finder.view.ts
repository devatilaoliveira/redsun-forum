import {Component, inject, signal, WritableSignal} from "@angular/core";
import {ITaleService, TaleService} from "../../../services/tale.service";
import {TalesGridComponent} from "../../shared/ui/tales-grid/tales-grid.component";
import {TranslatePipe} from "@ngx-translate/core";
import {RsSelect} from "../../shared/fragments/rsSelect/rs.select";
import {ELanguage} from "../../../interface/enums/ELanguage";
import {ERuleSystem} from "../../../interface/enums/ERuleSystem";

@Component({
  selector: "rs-tale-finder",
  standalone: true,
  imports: [TalesGridComponent, TranslatePipe, RsSelect],
  templateUrl: "./tale-finder.view.html",
  styleUrl: "./tale-finder.view.scss"
})
export class TaleFinderView {
  private readonly _taleService: ITaleService = inject(TaleService);

  protected readonly ELanguage = ELanguage;
  protected readonly ERuleSystem = ERuleSystem;
  protected readonly selectedLanguage: WritableSignal<ELanguage | null> = signal<ELanguage | null>(null);
  protected readonly selectedRules: WritableSignal<ERuleSystem | null> = signal<ERuleSystem | null>(null);
  protected readonly reloadToken: WritableSignal<number> = signal<number>(0);

  protected readonly loadPublicTales = (page: number = 0) => this._taleService.getPublicTales({
    page,
    language: this.selectedLanguage(),
    rules: this.selectedRules()
  });

  protected onLanguageChange(value: string | null): void {
    const nextLanguage = this.toEnumValue(ELanguage, value);
    if (nextLanguage === this.selectedLanguage()) return;
    this.selectedLanguage.set(nextLanguage);
    this.reloadTales();
  }

  protected onRulesChange(value: string | null): void {
    const nextRules = this.toEnumValue(ERuleSystem, value);
    if (nextRules === this.selectedRules()) return;
    this.selectedRules.set(nextRules);
    this.reloadTales();
  }

  private reloadTales(): void {
    this.reloadToken.update((token) => token + 1);
  }

  private toEnumValue<T extends string>(options: Record<string, T>, value: string | null): T | null {
    if (!value) return null;
    const allowedValues: T[] = Object.values(options);
    return allowedValues.includes(value as T) ? value as T : null;
  }
}
