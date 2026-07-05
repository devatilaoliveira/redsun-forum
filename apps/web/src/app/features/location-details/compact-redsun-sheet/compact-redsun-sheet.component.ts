import {Component, computed, input, InputSignal, Signal} from "@angular/core";
import {TranslatePipe} from "@ngx-translate/core";
import {RedSunSheetResponseDTO} from "../../../../interface/dtos/characterSheet/RedSunSheetResponseDTO";

interface CompactSheetItem {
  labelKey?: string;
  label?: string;
  value: number;
}

interface CompactSheetGroup {
  titleKey: string;
  items: CompactSheetItem[];
}

interface CompactSheetSection {
  titleKey: string;
  groups: CompactSheetGroup[];
}

@Component({
  selector: "rs-compact-redsun-sheet",
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: "./compact-redsun-sheet.component.html",
  styleUrl: "./compact-redsun-sheet.component.scss"
})
export class CompactRedSunSheetComponent {
  public readonly sheet: InputSignal<RedSunSheetResponseDTO> = input.required<RedSunSheetResponseDTO>();

  protected readonly sections: Signal<CompactSheetSection[]> = computed(() => {
    const sheet = this.sheet();

    return [
      {
        titleKey: "ATTRIBUTES",
        groups: [
          {titleKey: "PHYSICAL", items: this.items([["STRENGTH", sheet.strength], ["DEXTERITY", sheet.dexterity], ["VIGOR", sheet.stamina]])},
          {titleKey: "SOCIAL", items: this.items([["PRESENCE", sheet.presence], ["EMPATHY", sheet.empathy], ["INFLUENCE", sheet.influence]])},
          {titleKey: "MENTAL", items: this.items([["PERCEPTION", sheet.perception], ["INTELLECT", sheet.intellect], ["DETERMINATION", sheet.determination]])}
        ]
      },
      {
        titleKey: "ABILITIES",
        groups: [
          {
            titleKey: "TALENTS",
            items: [
              ...this.items([
                ["ALERTNESS", sheet.alertness],
                ["SPORTS", sheet.sports],
                ["INTUITION", sheet.intuition],
                ["INTIMIDATION", sheet.intimidation],
                ["SUBTERFUGE", sheet.subterfuge],
                ["LEADERSHIP", sheet.leadership],
                ["DIPLOMACY", sheet.diplomacy]
              ]),
              ...this.customItems([[sheet.talent1Name, sheet.talent1Level], [sheet.talent2Name, sheet.talent2Level]])
            ]
          },
          {
            titleKey: "SKILLS",
            items: this.items([
              ["ANIMAL_HANDLING", sheet.animalHandling],
              ["RIDING", sheet.riding],
              ["LEGERDEMAIN", sheet.legerdemain],
              ["SURVIVAL", sheet.survival],
              ["STEALTH", sheet.stealth],
              ["ETIQUETTE", sheet.etiquette],
              ["PERFORMANCE", sheet.performance]
            ])
          },
          {
            titleKey: "KNOWLEDGE",
            items: this.items([
              ["HISTORY", sheet.history],
              ["RELIGION", sheet.religion],
              ["LANGUAGE", sheet.language],
              ["OCCULTISM", sheet.occultism],
              ["INVESTIGATION", sheet.investigation],
              ["PSYCHOLOGY", sheet.psychology],
              ["BUSINESS", sheet.business]
            ])
          }
        ]
      },
      {
        titleKey: "ADVANTAGES",
        groups: [
          {
            titleKey: "CALLINGS",
            items: this.customItems([
              [sheet.calling1Name, sheet.calling1Level],
              [sheet.calling2Name, sheet.calling2Level],
              [sheet.calling3Name, sheet.calling3Level],
              [sheet.calling4Name, sheet.calling4Level],
              [sheet.calling5Name, sheet.calling5Level]
            ])
          },
          {
            titleKey: "SPECIALIZATIONS",
            items: this.items([
              ["MARTIAL_ARTS", sheet.martialArts],
              ["HERBALISM", sheet.herbalism],
              ["RITUALS", sheet.rituals],
              ["MEDITATION", sheet.meditation],
              ["CRAFT", sheet.craft]
            ])
          },
          {
            titleKey: "COMBAT",
            items: this.items([
              ["MELEE_WEAPONS", sheet.meleeThrowing],
              ["RANGED_WEAPONS", sheet.rangedWeapons],
              ["UNARMED", sheet.unarmed],
              ["THROWING", sheet.throwing],
              ["EXOTIC_WEAPONS", sheet.exoticWeapons]
            ])
          }
        ]
      }
    ];
  });

  private items(values: [string, number][]): CompactSheetItem[] {
    return values.map(([labelKey, value]) => ({labelKey, value}));
  }

  private customItems(values: [string | null, number][]): CompactSheetItem[] {
    return values
      .map(([label, value]) => ({label: label?.trim() ?? "", value}))
      .filter((item) => item.label.length > 0);
  }
}
