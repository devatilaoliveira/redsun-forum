import {NgStyle, NgTemplateOutlet} from "@angular/common";
import {Component, input, InputSignal, output, OutputEmitterRef} from "@angular/core";
import {RouterLink} from "@angular/router";
import type {UrlTree} from "@angular/router";
import {EVariant} from "../../../../interface/enums/EVariant";
import {ESize} from "../../../../interface/enums/ESize";
import {RsSpinner} from "../rsSpinner/rs.spinner";
import {IStyleMap} from "../../../../interface/models/istyle-map";

export type RsButtonTextKind = "button" | "link";
export type RsButtonTextRoute = string | unknown[] | UrlTree | null;
export type RsButtonTextVariant = EVariant | "muted";

@Component({
  selector: "rs-button-text",
  standalone: true,
  imports: [RsSpinner, NgStyle, NgTemplateOutlet, RouterLink],
  templateUrl: "./rs.button-text.html",
  styleUrl: "./rs.button-text.scss"
})
export class RsButtonText {
  public readonly kind: InputSignal<RsButtonTextKind> = input<RsButtonTextKind>("button");
  public readonly type: InputSignal<"button" | "submit" | "reset"> = input<"button" | "submit" | "reset">("button");
  public readonly form: InputSignal<string | null> = input<string | null>(null);
  public readonly routePath: InputSignal<RsButtonTextRoute> = input<RsButtonTextRoute>(null);
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly inProgress: InputSignal<boolean> = input<boolean>(false);
  public readonly variant: InputSignal<RsButtonTextVariant> = input<RsButtonTextVariant>(EVariant.PRIMARY);
  public readonly size: InputSignal<ESize> = input<ESize>(ESize.M);
  public readonly pressed: OutputEmitterRef<void> = output<void>();
  public readonly customStyle: InputSignal<IStyleMap | null> = input<IStyleMap | null>(null);

  protected onClick(event: MouseEvent): void {
    if (this.disabled() || this.inProgress()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.pressed.emit();
  }

  protected interactiveRoutePath(): RsButtonTextRoute {
    if (this.disabled() || this.inProgress()) {
      return null;
    }

    return this.routePath();
  }

  protected readonly EVariant = EVariant;
}
