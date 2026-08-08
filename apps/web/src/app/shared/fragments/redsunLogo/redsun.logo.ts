import {NgOptimizedImage} from "@angular/common";
import {booleanAttribute, Component, computed, inject, InputSignal, input, Signal} from "@angular/core";
import {AppSettingsService, IAppSettingsService} from "../../../../services/app-settings.service";
import {EThemeApplication} from "../../../../interface/enums/EThemeApplication";

@Component({
  selector: "rs-logo",
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: "./redsun.logo.html",
  styleUrl: "./redsun.logo.scss",
  host: {
    "[class.rs-logo--fill]": "fill()"
  }
})
export class RedsunLogo {
  public readonly alt: InputSignal<string> = input<string>("Red Sun logo");
  public readonly fill = input(false, {transform: booleanAttribute});
  public readonly priority = input(false, {transform: booleanAttribute});

  private readonly _appSettingsService: IAppSettingsService = inject(AppSettingsService);
  protected readonly logoSrc: Signal<string> = computed(() =>
    this._appSettingsService.theme() === EThemeApplication.LIGHT
      ? "assets/svgs/rs-light.svg"
      : "assets/svgs/rs.svg"
  );
}
