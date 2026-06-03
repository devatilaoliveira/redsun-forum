import {Component, computed, Signal, signal, WritableSignal} from "@angular/core";
import {EVariant} from "../../../../interface/enums/EVariant";
import {RsDivider} from "../../../shared/fragments/rsDivider/rs.divider";
import {RsCheckbox} from "../../../shared/fragments/rsCheckbox/rs.checkbox";
import {RsInput} from "../../../shared/fragments/rsInput/rs.input";
import {RsRoundIconButton} from "../../../shared/fragments/rsRoundIconButton/rs.round-icon-button";
import {RsTextarea} from "../../../shared/fragments/rsTextarea/rs.textarea";
import {LimitedResourcesComponent} from "../../../shared/ui/limited-resources/limited-resources.component";
import {clampRank} from "../../../shared/ui/rank-selection";
import {SkillBulletsComponent} from "../../../shared/ui/skill-bullets/skill-bullets.component";

interface RedSunTextField {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

interface RedSunRankField {
  readonly key: string;
  readonly label: string;
  readonly value: number;
}

interface RedSunLimitedResource {
  readonly key: string;
  readonly label: string;
  readonly maximumValue: number;
  readonly currentValue: number;
}

interface RedSunFieldGroup<TField> {
  readonly key: string;
  readonly title: string;
  readonly fields: readonly TField[];
}

@Component({
  selector: "rs-redsun-sheet",
  standalone: true,
  imports: [
    RsCheckbox,
    RsDivider,
    RsInput,
    RsRoundIconButton,
    RsTextarea,
    LimitedResourcesComponent,
    SkillBulletsComponent
  ],
  templateUrl: "./redsun-sheet.component.html",
  styleUrl: "./redsun-sheet.component.scss"
})
export class RedSunSheetComponent {
  protected readonly EVariant = EVariant;
  protected readonly sheetEditable: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly sheetButtonIcon: Signal<string> = computed<string>(() => {
    return this.sheetEditable() ? "/assets/svgs/save.svg" : "/assets/svgs/edit.svg";
  });
  protected readonly sheetButtonLabel: Signal<string> = computed<string>(() => {
    return this.sheetEditable() ? "Salvar ficha" : "Editar ficha";
  });
  protected readonly resourceSlots: number = 10;

  protected readonly identification: readonly RedSunTextField[] = [
    {key: "name", label: "Nome", value: ""},
    {key: "player", label: "Jogador", value: ""},
    {key: "nature", label: "Natureza", value: ""},
    {key: "demeanor", label: "Comportamento", value: ""}
  ];

  protected readonly attributes: readonly RedSunFieldGroup<RedSunRankField>[] = [
    {
      key: "physical",
      title: "Fisicos",
      fields: [
        {key: "strength", label: "Forca", value: 0},
        {key: "dexterity", label: "Destreza", value: 0},
        {key: "stamina", label: "Vigor", value: 0}
      ]
    },
    {
      key: "social",
      title: "Sociais",
      fields: [
        {key: "presence", label: "Presenca", value: 0},
        {key: "empathy", label: "Empatia", value: 0},
        {key: "influence", label: "Influencia", value: 0}
      ]
    },
    {
      key: "mental",
      title: "Mentais",
      fields: [
        {key: "perception", label: "Percepcao", value: 0},
        {key: "intellect", label: "Intelecto", value: 0},
        {key: "determination", label: "Determinacao", value: 0}
      ]
    }
  ];

  protected readonly abilities: readonly RedSunFieldGroup<RedSunRankField>[] = [
    {
      key: "talents",
      title: "Talentos",
      fields: [
        {key: "alertness", label: "Prontidao", value: 0},
        {key: "sports", label: "Esportes", value: 0},
        {key: "intuition", label: "Intuicao", value: 0},
        {key: "intimidation", label: "Intimidacao", value: 0},
        {key: "subterfuge", label: "Labia", value: 0},
        {key: "leadership", label: "Lideranca", value: 0},
        {key: "diplomacy", label: "Diplomacia", value: 0}
      ].concat(this.createBlankRankFields("talents", 2))
    },
    {
      key: "skills",
      title: "Pericias",
      fields: [
        {key: "animal_handling", label: "Adestrar", value: 0},
        {key: "riding", label: "Cavalgar", value: 0},
        {key: "legerdemain", label: "Prestidigitacao", value: 0},
        {key: "survival", label: "Sobrevivencia", value: 0},
        {key: "stealth", label: "Furtividade", value: 0},
        {key: "athletics", label: "Atletismo", value: 0},
        {key: "performance", label: "Performance", value: 0}
      ].concat(this.createBlankRankFields("skills", 2))
    },
    {
      key: "knowledges",
      title: "Conhecimentos",
      fields: [
        {key: "history", label: "Historia", value: 0},
        {key: "religion", label: "Religiao", value: 0},
        {key: "language", label: "Lingua", value: 0},
        {key: "occultism", label: "Ocultismo", value: 0},
        {key: "investigation", label: "Investigacao", value: 0},
        {key: "psychology", label: "Psicologia", value: 0},
        {key: "business", label: "Negocios", value: 0}
      ].concat(this.createBlankRankFields("knowledges", 2))
    }
  ];

  protected readonly advantages: readonly RedSunFieldGroup<RedSunRankField>[] = [
    {
      key: "callings",
      title: "vacações",
      fields: this.createBlankRankFields("callings", 5)
    },
    {
      key: "specializations",
      title: "Especializacoes",
      fields: [
        {key: "martial_arts", label: "Artes Marciais", value: 0},
        {key: "herbalism", label: "Herborismo", value: 0},
        {key: "rituals", label: "Rituais", value: 0},
        {key: "meditation", label: "Meditacao", value: 0},
        {key: "craft", label: "Oficio", value: 0}
      ]
    },
    {
      key: "combat",
      title: "Combate",
      fields: [
        {key: "melee_throwing", label: "Armas Brancas", value: 0},
        {key: "ranged_weapons", label: "Armas a Distancia", value: 0},
        {key: "unarmed", label: "Desarmado", value: 0}
      ]
    }
  ];

  protected readonly backgrounds: readonly RedSunTextField[] = this.createBlankTextFields("background", 6);

  protected readonly resources: WritableSignal<readonly RedSunLimitedResource[]> = signal<
    readonly RedSunLimitedResource[]
  >([
    {key: "willpower", label: "Força de Vontade", maximumValue: 5, currentValue: 5},
    {key: "impetus", label: "Ímpeto", maximumValue: 5, currentValue: 5}
  ]);

  protected readonly health: readonly RedSunTextField[] = [
    {key: "bruised", label: "Escoriado", value: ""},
    {key: "hurt", label: "Machucado", value: ""},
    {key: "injured", label: "Ferido", value: ""},
    {key: "badly_wounded", label: "Ferido Gravemente", value: ""},
    {key: "mauled", label: "Espancado", value: ""},
    {key: "crippled", label: "Aleijado", value: ""},
    {key: "incapacitated", label: "Incapacitado", value: ""},
    {key: "torpor", label: "Torpor", value: ""},
    {key: "final_death", label: "Morte Final", value: ""}
  ];

  protected readonly textFields: readonly RedSunTextField[] = [
    {key: "experience", label: "Experiencia", value: ""},
    {key: "equipment", label: "Equipamento", value: ""},
    {key: "notes", label: "Anotacoes", value: ""},
    {key: "active_rituals_effects", label: "Rituais e Efeitos Ativos", value: ""},
    {key: "combat_maneuvers", label: "Manobras de Combate", value: ""},
    {key: "arsenal", label: "Arsenal", value: ""},
    {key: "learned_rituals", label: "Rituais aprendidos", value: ""},
    {key: "craft", label: "Ofício", value: ""}
  ];

  private createBlankRankFields(prefix: string, count: number): readonly RedSunRankField[] {
    return Array.from({length: count}, (_, index: number) => ({
      key: `${prefix}_${index + 1}`,
      label: "",
      value: 0
    }));
  }

  private createBlankTextFields(prefix: string, count: number): readonly RedSunTextField[] {
    return Array.from({length: count}, (_, index: number) => ({
      key: `${prefix}_${index + 1}`,
      label: "",
      value: ""
    }));
  }

  protected toggleSheetEditMode(): void {
    this.sheetEditable.update((editable: boolean) => !editable);
  }

  protected updateResourceMaximum(resourceKey: string, maximumValue: number): void {
    this.resources.update((resources: readonly RedSunLimitedResource[]) => {
      return resources.map((resource: RedSunLimitedResource) => {
        if (resource.key !== resourceKey) return resource;

        const nextMaximumValue: number = this.normalizeResourceValue(maximumValue, this.resourceSlots);

        return {
          ...resource,
          maximumValue: nextMaximumValue,
          currentValue: this.normalizeResourceValue(resource.currentValue, nextMaximumValue)
        };
      });
    });
  }

  protected updateResourceCurrent(resourceKey: string, currentValue: number): void {
    this.resources.update((resources: readonly RedSunLimitedResource[]) => {
      return resources.map((resource: RedSunLimitedResource) => {
        if (resource.key !== resourceKey) return resource;

        return {
          ...resource,
          currentValue: this.normalizeResourceValue(currentValue, resource.maximumValue)
        };
      });
    });
  }

  private normalizeResourceValue(value: number, maximumValue: number): number {
    return clampRank(Math.floor(value), 0, maximumValue);
  }
}
