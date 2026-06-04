import {Component, effect, inject, input, InputSignal} from "@angular/core";
import {FormControl, FormGroup, FormRecord, NonNullableFormBuilder} from "@angular/forms";
import {
  RedSunLimitedResourceDTO,
  RedSunSheetDTO,
  RedSunSkillDTO
} from "../../../../interface/dtos/characterSheet/RedSunSheetDTO";
import {UpsertRedSunSheetDTO} from "../../../../interface/dtos/characterSheet/UpsertRedSunSheetDTO";
import {RsCheckbox} from "../../../shared/fragments/rsCheckbox/rs.checkbox";
import {RsDivider} from "../../../shared/fragments/rsDivider/rs.divider";
import {RsInput} from "../../../shared/fragments/rsInput/rs.input";
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

interface RedSunCheckField {
  readonly key: string;
  readonly label: string;
  readonly checked: boolean;
}

interface RedSunFieldGroup<TField> {
  readonly key: string;
  readonly title: string;
  readonly fields: readonly TField[];
}

interface RedSunSkillFormControls {
  name: FormControl<string>;
  level: FormControl<number>;
}

interface RedSunLimitedResourceFormControls {
  maximumValue: FormControl<number>;
  currentValue: FormControl<number>;
}

interface RedSunSheetFormControls {
  identification: FormRecord<FormControl<string>>;
  attributes: FormRecord<FormControl<number>>;
  abilities: FormRecord<FormGroup<RedSunSkillFormControls>>;
  advantages: FormRecord<FormGroup<RedSunSkillFormControls>>;
  backgrounds: FormRecord<FormControl<string>>;
  resources: FormRecord<FormGroup<RedSunLimitedResourceFormControls>>;
  health: FormRecord<FormControl<boolean>>;
  details: FormRecord<FormControl<string>>;
}

@Component({
  selector: "rs-redsun-sheet",
  standalone: true,
  imports: [
    RsCheckbox,
    RsDivider,
    RsInput,
    RsTextarea,
    LimitedResourcesComponent,
    SkillBulletsComponent
  ],
  templateUrl: "./redsun-sheet.component.html",
  styleUrl: "./redsun-sheet.component.scss"
})
export class RedSunSheetComponent {
  private readonly _formBuilder: NonNullableFormBuilder = inject(NonNullableFormBuilder);

  public readonly sheet: InputSignal<RedSunSheetDTO | null | undefined> = input<RedSunSheetDTO | null | undefined>(
    undefined
  );
  public readonly sheetEditable: InputSignal<boolean> = input<boolean>(false);

  protected readonly resourceSlots: number = 10;

  protected readonly identification: readonly RedSunTextField[] = [
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
      title: "Especializações",
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

  protected readonly resourceFields: readonly RedSunLimitedResource[] = [
    {key: "willpower", label: "Força de Vontade", maximumValue: 5, currentValue: 5},
    {key: "impetus", label: "Ímpeto", maximumValue: 5, currentValue: 5}
  ];

  protected readonly health: readonly RedSunCheckField[] = [
    {key: "bruised", label: "Escoriado", checked: false},
    {key: "hurt", label: "Machucado", checked: false},
    {key: "injured", label: "Ferido", checked: false},
    {key: "badly_wounded", label: "Ferido Gravemente", checked: false},
    {key: "mauled", label: "Espancado", checked: false},
    {key: "crippled", label: "Aleijado", checked: false},
    {key: "incapacitated", label: "Incapacitado", checked: false},
    {key: "torpor", label: "Torpor", checked: false},
    {key: "final_death", label: "Morte Final", checked: false}
  ];

  protected readonly textFields: readonly RedSunTextField[] = [
    {key: "experience", label: "Experiencia", value: ""},
    {key: "equipment", label: "Equipamento", value: ""},
    {key: "notes", label: "Anotacoes", value: ""},
    {key: "active_rituals_effects", label: "Rituais e Efeitos Ativos", value: ""},
    {key: "combat_maneuvers", label: "Manobras de Combate", value: ""},
    {key: "arsenal", label: "Arsenal", value: ""},
    {key: "learned_rituals", label: "Rituais aprendidos", value: ""},
    {key: "craft", label: "Oficio", value: ""}
  ];

  protected readonly form: FormGroup<RedSunSheetFormControls> = new FormGroup<RedSunSheetFormControls>({
    identification: this.createTextRecord(this.identification),
    attributes: this.createRankRecord(this.attributes),
    abilities: this.createSkillRecord(this.abilities),
    advantages: this.createSkillRecord(this.advantages),
    backgrounds: this.createTextRecord(this.backgrounds),
    resources: this.createResourceRecord(this.resourceFields),
    health: this.createCheckRecord(this.health),
    details: this.createTextRecord(this.textFields)
  });

  constructor() {
    effect(() => {
      const sheet: RedSunSheetDTO | null | undefined = this.sheet();
      if (sheet !== undefined) {
        this.patchValue(sheet);
      }
    });
  }

  public isDirty(): boolean {
    return this.form.dirty;
  }

  public isInvalid(): boolean {
    return this.form.invalid;
  }

  public markAllAsTouched(): void {
    this.form.markAllAsTouched();
  }

  public markAsSaved(): void {
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  public patchValue(sheet: RedSunSheetDTO | null): void {
    this.patchTextRecord(this.form.controls.identification, this.identification, sheet?.identification);
    this.patchRankRecord(this.form.controls.attributes, this.attributes, sheet?.attributes);
    this.patchSkillRecord(this.form.controls.abilities, this.abilities, sheet?.abilities);
    this.patchSkillRecord(this.form.controls.advantages, this.advantages, sheet?.advantages);
    this.patchTextRecord(this.form.controls.backgrounds, this.backgrounds, sheet?.backgrounds);
    this.patchResourceRecord(this.form.controls.resources, this.resourceFields, sheet?.resources);
    this.patchCheckRecord(this.form.controls.health, this.health, sheet?.health);
    this.patchTextRecord(this.form.controls.details, this.textFields, sheet?.details);
    this.markAsSaved();
  }

  public toUpsertDto(): UpsertRedSunSheetDTO {
    return {
      identification: this.textRecordToDto(this.form.controls.identification),
      attributes: this.rankRecordToDto(this.form.controls.attributes),
      abilities: this.skillRecordToDto(this.form.controls.abilities),
      advantages: this.skillRecordToDto(this.form.controls.advantages),
      backgrounds: this.textRecordToDto(this.form.controls.backgrounds),
      resources: this.resourceRecordToDto(this.form.controls.resources),
      health: this.checkRecordToDto(this.form.controls.health),
      details: this.textRecordToDto(this.form.controls.details)
    };
  }

  protected textControl(record: FormRecord<FormControl<string>>, key: string): FormControl<string> {
    return record.controls[key];
  }

  protected rankControl(record: FormRecord<FormControl<number>>, key: string): FormControl<number> {
    return record.controls[key];
  }

  protected skillControl(
    record: FormRecord<FormGroup<RedSunSkillFormControls>>,
    key: string
  ): FormGroup<RedSunSkillFormControls> {
    return record.controls[key];
  }

  protected resourceControl(
    record: FormRecord<FormGroup<RedSunLimitedResourceFormControls>>,
    key: string
  ): FormGroup<RedSunLimitedResourceFormControls> {
    return record.controls[key];
  }

  protected checkControl(record: FormRecord<FormControl<boolean>>, key: string): FormControl<boolean> {
    return record.controls[key];
  }

  protected setTextValue(control: FormControl<string>, value: string): void {
    control.setValue(value);
    control.markAsDirty();
  }

  protected setNumberValue(control: FormControl<number>, value: number): void {
    control.setValue(clampRank(Math.floor(value), 0, 10));
    control.markAsDirty();
  }

  protected setBooleanValue(control: FormControl<boolean>, value: boolean): void {
    control.setValue(value);
    control.markAsDirty();
  }

  protected setResourceMaximum(resourceKey: string, maximumValue: number): void {
    const control: FormGroup<RedSunLimitedResourceFormControls> = this.resourceControl(
      this.form.controls.resources,
      resourceKey
    );
    const nextMaximumValue: number = clampRank(Math.floor(maximumValue), 0, this.resourceSlots);
    control.controls.maximumValue.setValue(nextMaximumValue);
    control.controls.maximumValue.markAsDirty();

    if (control.controls.currentValue.value > nextMaximumValue) {
      control.controls.currentValue.setValue(nextMaximumValue);
      control.controls.currentValue.markAsDirty();
    }
  }

  protected setResourceCurrent(resourceKey: string, currentValue: number): void {
    const control: FormGroup<RedSunLimitedResourceFormControls> = this.resourceControl(
      this.form.controls.resources,
      resourceKey
    );
    control.controls.currentValue.setValue(clampRank(Math.floor(currentValue), 0, control.controls.maximumValue.value));
    control.controls.currentValue.markAsDirty();
  }

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

  private createTextRecord(fields: readonly RedSunTextField[]): FormRecord<FormControl<string>> {
    const controls: Record<string, FormControl<string>> = {};
    fields.forEach((field: RedSunTextField) => {
      controls[field.key] = this._formBuilder.control<string>(field.value);
    });
    return new FormRecord<FormControl<string>>(controls);
  }

  private createRankRecord(groups: readonly RedSunFieldGroup<RedSunRankField>[]): FormRecord<FormControl<number>> {
    const controls: Record<string, FormControl<number>> = {};
    this.flattenGroups(groups).forEach((field: RedSunRankField) => {
      controls[field.key] = this._formBuilder.control<number>(field.value);
    });
    return new FormRecord<FormControl<number>>(controls);
  }

  private createSkillRecord(
    groups: readonly RedSunFieldGroup<RedSunRankField>[]
  ): FormRecord<FormGroup<RedSunSkillFormControls>> {
    const controls: Record<string, FormGroup<RedSunSkillFormControls>> = {};
    this.flattenGroups(groups).forEach((field: RedSunRankField) => {
      controls[field.key] = this.createSkillControl(field.label, field.value);
    });
    return new FormRecord<FormGroup<RedSunSkillFormControls>>(controls);
  }

  private createResourceRecord(
    fields: readonly RedSunLimitedResource[]
  ): FormRecord<FormGroup<RedSunLimitedResourceFormControls>> {
    const controls: Record<string, FormGroup<RedSunLimitedResourceFormControls>> = {};
    fields.forEach((field: RedSunLimitedResource) => {
      controls[field.key] = new FormGroup<RedSunLimitedResourceFormControls>({
        maximumValue: this._formBuilder.control<number>(field.maximumValue),
        currentValue: this._formBuilder.control<number>(field.currentValue)
      });
    });
    return new FormRecord<FormGroup<RedSunLimitedResourceFormControls>>(controls);
  }

  private createCheckRecord(fields: readonly RedSunCheckField[]): FormRecord<FormControl<boolean>> {
    const controls: Record<string, FormControl<boolean>> = {};
    fields.forEach((field: RedSunCheckField) => {
      controls[field.key] = this._formBuilder.control<boolean>(field.checked);
    });
    return new FormRecord<FormControl<boolean>>(controls);
  }

  private createSkillControl(name: string, level: number): FormGroup<RedSunSkillFormControls> {
    return new FormGroup<RedSunSkillFormControls>({
      name: this._formBuilder.control<string>(name),
      level: this._formBuilder.control<number>(level)
    });
  }

  private flattenGroups<TField>(groups: readonly RedSunFieldGroup<TField>[]): readonly TField[] {
    return groups.flatMap((group: RedSunFieldGroup<TField>) => group.fields);
  }

  private patchTextRecord(
    record: FormRecord<FormControl<string>>,
    fields: readonly RedSunTextField[],
    values: Record<string, string | null> | undefined
  ): void {
    fields.forEach((field: RedSunTextField) => {
      record.controls[field.key].setValue(values?.[field.key] ?? field.value, {emitEvent: false});
    });
  }

  private patchRankRecord(
    record: FormRecord<FormControl<number>>,
    groups: readonly RedSunFieldGroup<RedSunRankField>[],
    values: Record<string, number> | undefined
  ): void {
    this.flattenGroups(groups).forEach((field: RedSunRankField) => {
      record.controls[field.key].setValue(values?.[field.key] ?? field.value, {emitEvent: false});
    });
  }

  private patchSkillRecord(
    record: FormRecord<FormGroup<RedSunSkillFormControls>>,
    groups: readonly RedSunFieldGroup<RedSunRankField>[],
    values: Record<string, RedSunSkillDTO> | undefined
  ): void {
    this.flattenGroups(groups).forEach((field: RedSunRankField) => {
      const value: RedSunSkillDTO | undefined = values?.[field.key];
      record.controls[field.key].patchValue(
        {
          name: value?.name ?? field.label,
          level: value?.level ?? field.value
        },
        {emitEvent: false}
      );
    });
  }

  private patchResourceRecord(
    record: FormRecord<FormGroup<RedSunLimitedResourceFormControls>>,
    fields: readonly RedSunLimitedResource[],
    values: Record<string, RedSunLimitedResourceDTO> | undefined
  ): void {
    fields.forEach((field: RedSunLimitedResource) => {
      const value: RedSunLimitedResourceDTO | undefined = values?.[field.key];
      record.controls[field.key].patchValue(
        {
          maximumValue: value?.maximumValue ?? field.maximumValue,
          currentValue: value?.currentValue ?? field.currentValue
        },
        {emitEvent: false}
      );
    });
  }

  private patchCheckRecord(
    record: FormRecord<FormControl<boolean>>,
    fields: readonly RedSunCheckField[],
    values: Record<string, boolean> | undefined
  ): void {
    fields.forEach((field: RedSunCheckField) => {
      record.controls[field.key].setValue(values?.[field.key] ?? field.checked, {emitEvent: false});
    });
  }

  private textRecordToDto(record: FormRecord<FormControl<string>>): Record<string, string | null> {
    const values: Record<string, string | null> = {};
    Object.entries(record.controls).forEach(([key, control]: [string, FormControl<string>]) => {
      values[key] = this.toNullableText(control.value);
    });
    return values;
  }

  private rankRecordToDto(record: FormRecord<FormControl<number>>): Record<string, number> {
    const values: Record<string, number> = {};
    Object.entries(record.controls).forEach(([key, control]: [string, FormControl<number>]) => {
      values[key] = control.value;
    });
    return values;
  }

  private skillRecordToDto(record: FormRecord<FormGroup<RedSunSkillFormControls>>): Record<string, RedSunSkillDTO> {
    const values: Record<string, RedSunSkillDTO> = {};
    Object.entries(record.controls).forEach(([key, control]: [string, FormGroup<RedSunSkillFormControls>]) => {
      values[key] = {
        name: this.toNullableText(control.controls.name.value),
        level: control.controls.level.value
      };
    });
    return values;
  }

  private resourceRecordToDto(
    record: FormRecord<FormGroup<RedSunLimitedResourceFormControls>>
  ): Record<string, RedSunLimitedResourceDTO> {
    const values: Record<string, RedSunLimitedResourceDTO> = {};
    Object.entries(record.controls).forEach(
      ([key, control]: [string, FormGroup<RedSunLimitedResourceFormControls>]) => {
        values[key] = {
          maximumValue: control.controls.maximumValue.value,
          currentValue: control.controls.currentValue.value
        };
      }
    );
    return values;
  }

  private checkRecordToDto(record: FormRecord<FormControl<boolean>>): Record<string, boolean> {
    const values: Record<string, boolean> = {};
    Object.entries(record.controls).forEach(([key, control]: [string, FormControl<boolean>]) => {
      values[key] = control.value;
    });
    return values;
  }

  private toNullableText(value: string): string | null {
    const normalizedValue: string = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : null;
  }
}
