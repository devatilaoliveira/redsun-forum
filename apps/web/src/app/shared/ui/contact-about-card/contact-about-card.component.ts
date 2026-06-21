import {Component, computed, input, InputSignal, Signal} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";
import {UserAsContactProfileDTO} from "../../../../interface/dtos/user/UserAsContactProfileDTO";
import {EProfileLanguage} from "../../../../interface/enums/EProfileLanguage";
import {ERole} from "../../../../interface/enums/ERole";
import {ERuleSystem} from "../../../../interface/enums/ERuleSystem";
import {EVariant} from "../../../../interface/enums/EVariant";
import {RsBadge} from "../../fragments/rsBadge/rs.badge";
import {RsDivider} from "../../fragments/rsDivider/rs.divider";
import {RsExpandableText} from "../../fragments/rsExpandableText/rs.expandable-text";

@Component({
  selector: "rs-contact-about-card",
  standalone: true,
  imports: [TranslatePipe, RsBadge, RsDivider, RsExpandableText],
  templateUrl: "./contact-about-card.component.html",
  styleUrl: "./contact-about-card.component.scss"
})
export class ContactAboutCardComponent {
  public readonly contact: InputSignal<UserAsContactProfileDTO> = input.required<UserAsContactProfileDTO>();

  protected readonly EVariant = EVariant;
  protected readonly favoriteLanguages: Signal<EProfileLanguage[]> = computed<EProfileLanguage[]>(
    () => this.contact().favoriteLanguage ?? []
  );

  protected readonly favoriteRoles: Signal<ERole[]> = computed<ERole[]>(
    () => this.contact().favoriteRole ?? []
  );

  protected readonly favoriteRules: Signal<ERuleSystem[]> = computed<ERuleSystem[]>(
    () => this.contact().favoriteRules ?? []
  );

  protected readonly description: Signal<string | null> = computed<string | null>(() => {
    const description = this.contact().description?.trim();
    return description?.length ? description : null;
  });

  protected readonly hasPreferences: Signal<boolean> = computed<boolean>(() => (
    this.favoriteLanguages().length > 0 ||
    this.favoriteRules().length > 0 ||
    this.favoriteRoles().length > 0
  ));

  protected languageLabelKey(language: EProfileLanguage): string {
    return `LANGUAGE_${language}`;
  }

  protected rulesLabelKey(rules: ERuleSystem): string {
    return `SYSTEM_RULE_${rules}`;
  }

  protected roleLabelKey(role: ERole): string {
    return `ROLE_${role}`;
  }
}
