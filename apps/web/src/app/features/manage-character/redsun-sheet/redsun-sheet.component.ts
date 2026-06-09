import {Component, effect, input, InputSignal} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {TranslatePipe} from "@ngx-translate/core";
import {UTIL_CONSTANTS} from "../../../../interface/constants/util.constants";
import {RedSunSheetResponseDTO} from "../../../../interface/dtos/characterSheet/RedSunSheetResponseDTO";
import {UpsertRedSunSheetDTO} from "../../../../interface/dtos/characterSheet/UpsertRedSunSheetDTO";
import {RsDivider} from "../../../shared/fragments/rsDivider/rs.divider";
import {RsInput} from "../../../shared/fragments/rsInput/rs.input";
import {RsTextarea} from "../../../shared/fragments/rsTextarea/rs.textarea";
import {LimitedResourcesComponent} from "../../../shared/ui/limited-resources/limited-resources.component";
import {clampRank} from "../../../shared/ui/rank-selection";
import {SkillBulletsComponent} from "../../../shared/ui/skill-bullets/skill-bullets.component";
import {VitalityTrackComponent} from "./vitality-track/vitality-track.component";

type RedSunControlValue<T> = T extends string | null ? string : T;
type RedSunSheetFormControls = {
  [K in keyof UpsertRedSunSheetDTO]: FormControl<RedSunControlValue<UpsertRedSunSheetDTO[K]>>;
};

const DEFAULT_REDSUN_SHEET: UpsertRedSunSheetDTO = {
  nature: null,
  demeanor: null,
  strength: 0,
  dexterity: 0,
  stamina: 0,
  presence: 0,
  empathy: 0,
  influence: 0,
  perception: 0,
  intellect: 0,
  determination: 0,
  alertness: 0,
  sports: 0,
  intuition: 0,
  intimidation: 0,
  subterfuge: 0,
  leadership: 0,
  diplomacy: 0,
  talent1Name: null,
  talent1Level: 0,
  talent2Name: null,
  talent2Level: 0,
  animalHandling: 0,
  riding: 0,
  legerdemain: 0,
  survival: 0,
  stealth: 0,
  athletics: 0,
  performance: 0,
  history: 0,
  religion: 0,
  language: 0,
  occultism: 0,
  investigation: 0,
  psychology: 0,
  business: 0,
  calling1Name: null,
  calling1Level: 0,
  calling2Name: null,
  calling2Level: 0,
  calling3Name: null,
  calling3Level: 0,
  calling4Name: null,
  calling4Level: 0,
  calling5Name: null,
  calling5Level: 0,
  martialArts: 0,
  herbalism: 0,
  rituals: 0,
  meditation: 0,
  craft: 0,
  meleeThrowing: 0,
  rangedWeapons: 0,
  unarmed: 0,
  throwing: 0,
  exoticWeapons: 0,
  willpowerMax: 0,
  willpowerCurrent: 0,
  impetusMax: 0,
  impetusCurrent: 0,
  vitalityDamage: 0,
  experience: null,
  equipment: null,
  notes: null,
  activeRitualsEffects: null,
  combatManeuvers: null,
  arsenal: null,
  learnedRituals: null,
  craftDetails: null
};

@Component({
  selector: "rs-redsun-sheet",
  standalone: true,
  imports: [
    RsDivider,
    RsInput,
    RsTextarea,
    LimitedResourcesComponent,
    SkillBulletsComponent,
    TranslatePipe,
    VitalityTrackComponent
  ],
  templateUrl: "./redsun-sheet.component.html",
  styleUrl: "./redsun-sheet.component.scss"
})
export class RedSunSheetComponent {
  public readonly sheet: InputSignal<RedSunSheetResponseDTO | null | undefined> = input<RedSunSheetResponseDTO | null | undefined>(
    undefined
  );
  public readonly sheetEditable: InputSignal<boolean> = input<boolean>(false);

  protected readonly resourceSlots: number = 10;
  protected readonly SHORT_TEXT_LENGTH: number = UTIL_CONSTANTS.SHORT_TEXT_LENGTH;
  protected readonly form: FormGroup<RedSunSheetFormControls> = new FormGroup<RedSunSheetFormControls>({
    nature: new FormControl<string>("", {nonNullable: true}),
    demeanor: new FormControl<string>("", {nonNullable: true}),
    strength: new FormControl<number>(0, {nonNullable: true}),
    dexterity: new FormControl<number>(0, {nonNullable: true}),
    stamina: new FormControl<number>(0, {nonNullable: true}),
    presence: new FormControl<number>(0, {nonNullable: true}),
    empathy: new FormControl<number>(0, {nonNullable: true}),
    influence: new FormControl<number>(0, {nonNullable: true}),
    perception: new FormControl<number>(0, {nonNullable: true}),
    intellect: new FormControl<number>(0, {nonNullable: true}),
    determination: new FormControl<number>(0, {nonNullable: true}),
    alertness: new FormControl<number>(0, {nonNullable: true}),
    sports: new FormControl<number>(0, {nonNullable: true}),
    intuition: new FormControl<number>(0, {nonNullable: true}),
    intimidation: new FormControl<number>(0, {nonNullable: true}),
    subterfuge: new FormControl<number>(0, {nonNullable: true}),
    leadership: new FormControl<number>(0, {nonNullable: true}),
    diplomacy: new FormControl<number>(0, {nonNullable: true}),
    talent1Name: new FormControl<string>("", {nonNullable: true}),
    talent1Level: new FormControl<number>(0, {nonNullable: true}),
    talent2Name: new FormControl<string>("", {nonNullable: true}),
    talent2Level: new FormControl<number>(0, {nonNullable: true}),
    animalHandling: new FormControl<number>(0, {nonNullable: true}),
    riding: new FormControl<number>(0, {nonNullable: true}),
    legerdemain: new FormControl<number>(0, {nonNullable: true}),
    survival: new FormControl<number>(0, {nonNullable: true}),
    stealth: new FormControl<number>(0, {nonNullable: true}),
    athletics: new FormControl<number>(0, {nonNullable: true}),
    performance: new FormControl<number>(0, {nonNullable: true}),
    history: new FormControl<number>(0, {nonNullable: true}),
    religion: new FormControl<number>(0, {nonNullable: true}),
    language: new FormControl<number>(0, {nonNullable: true}),
    occultism: new FormControl<number>(0, {nonNullable: true}),
    investigation: new FormControl<number>(0, {nonNullable: true}),
    psychology: new FormControl<number>(0, {nonNullable: true}),
    business: new FormControl<number>(0, {nonNullable: true}),
    calling1Name: new FormControl<string>("", {nonNullable: true}),
    calling1Level: new FormControl<number>(0, {nonNullable: true}),
    calling2Name: new FormControl<string>("", {nonNullable: true}),
    calling2Level: new FormControl<number>(0, {nonNullable: true}),
    calling3Name: new FormControl<string>("", {nonNullable: true}),
    calling3Level: new FormControl<number>(0, {nonNullable: true}),
    calling4Name: new FormControl<string>("", {nonNullable: true}),
    calling4Level: new FormControl<number>(0, {nonNullable: true}),
    calling5Name: new FormControl<string>("", {nonNullable: true}),
    calling5Level: new FormControl<number>(0, {nonNullable: true}),
    martialArts: new FormControl<number>(0, {nonNullable: true}),
    herbalism: new FormControl<number>(0, {nonNullable: true}),
    rituals: new FormControl<number>(0, {nonNullable: true}),
    meditation: new FormControl<number>(0, {nonNullable: true}),
    craft: new FormControl<number>(0, {nonNullable: true}),
    meleeThrowing: new FormControl<number>(0, {nonNullable: true}),
    rangedWeapons: new FormControl<number>(0, {nonNullable: true}),
    unarmed: new FormControl<number>(0, {nonNullable: true}),
    throwing: new FormControl<number>(0, {nonNullable: true}),
    exoticWeapons: new FormControl<number>(0, {nonNullable: true}),
    willpowerMax: new FormControl<number>(0, {nonNullable: true}),
    willpowerCurrent: new FormControl<number>(0, {nonNullable: true}),
    impetusMax: new FormControl<number>(0, {nonNullable: true}),
    impetusCurrent: new FormControl<number>(0, {nonNullable: true}),
    vitalityDamage: new FormControl<number>(0, {nonNullable: true}),
    experience: new FormControl<string>("", {nonNullable: true}),
    equipment: new FormControl<string>("", {nonNullable: true}),
    notes: new FormControl<string>("", {nonNullable: true}),
    activeRitualsEffects: new FormControl<string>("", {nonNullable: true}),
    combatManeuvers: new FormControl<string>("", {nonNullable: true}),
    arsenal: new FormControl<string>("", {nonNullable: true}),
    learnedRituals: new FormControl<string>("", {nonNullable: true}),
    craftDetails: new FormControl<string>("", {nonNullable: true})
  });
  protected readonly controls = this.form.controls;

  constructor() {
    effect(() => {
      const sheet: RedSunSheetResponseDTO | null | undefined = this.sheet();
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

  public patchValue(sheet: RedSunSheetResponseDTO | null): void {
    const value: UpsertRedSunSheetDTO = {...DEFAULT_REDSUN_SHEET, ...(sheet ?? {})};
    this.form.patchValue({
      ...value,
      nature: value.nature ?? "",
      demeanor: value.demeanor ?? "",
      talent1Name: value.talent1Name ?? "",
      talent2Name: value.talent2Name ?? "",
      calling1Name: value.calling1Name ?? "",
      calling2Name: value.calling2Name ?? "",
      calling3Name: value.calling3Name ?? "",
      calling4Name: value.calling4Name ?? "",
      calling5Name: value.calling5Name ?? "",
      experience: value.experience ?? "",
      equipment: value.equipment ?? "",
      notes: value.notes ?? "",
      activeRitualsEffects: value.activeRitualsEffects ?? "",
      combatManeuvers: value.combatManeuvers ?? "",
      arsenal: value.arsenal ?? "",
      learnedRituals: value.learnedRituals ?? "",
      craftDetails: value.craftDetails ?? ""
    }, {emitEvent: false});
    this.markAsSaved();
  }

  public toUpsertDto(): UpsertRedSunSheetDTO {
    return {
      nature: this.toNullableText(this.controls.nature.value),
      demeanor: this.toNullableText(this.controls.demeanor.value),
      strength: this.controls.strength.value,
      dexterity: this.controls.dexterity.value,
      stamina: this.controls.stamina.value,
      presence: this.controls.presence.value,
      empathy: this.controls.empathy.value,
      influence: this.controls.influence.value,
      perception: this.controls.perception.value,
      intellect: this.controls.intellect.value,
      determination: this.controls.determination.value,
      alertness: this.controls.alertness.value,
      sports: this.controls.sports.value,
      intuition: this.controls.intuition.value,
      intimidation: this.controls.intimidation.value,
      subterfuge: this.controls.subterfuge.value,
      leadership: this.controls.leadership.value,
      diplomacy: this.controls.diplomacy.value,
      talent1Name: this.toNullableText(this.controls.talent1Name.value),
      talent1Level: this.controls.talent1Level.value,
      talent2Name: this.toNullableText(this.controls.talent2Name.value),
      talent2Level: this.controls.talent2Level.value,
      animalHandling: this.controls.animalHandling.value,
      riding: this.controls.riding.value,
      legerdemain: this.controls.legerdemain.value,
      survival: this.controls.survival.value,
      stealth: this.controls.stealth.value,
      athletics: this.controls.athletics.value,
      performance: this.controls.performance.value,
      history: this.controls.history.value,
      religion: this.controls.religion.value,
      language: this.controls.language.value,
      occultism: this.controls.occultism.value,
      investigation: this.controls.investigation.value,
      psychology: this.controls.psychology.value,
      business: this.controls.business.value,
      calling1Name: this.toNullableText(this.controls.calling1Name.value),
      calling1Level: this.controls.calling1Level.value,
      calling2Name: this.toNullableText(this.controls.calling2Name.value),
      calling2Level: this.controls.calling2Level.value,
      calling3Name: this.toNullableText(this.controls.calling3Name.value),
      calling3Level: this.controls.calling3Level.value,
      calling4Name: this.toNullableText(this.controls.calling4Name.value),
      calling4Level: this.controls.calling4Level.value,
      calling5Name: this.toNullableText(this.controls.calling5Name.value),
      calling5Level: this.controls.calling5Level.value,
      martialArts: this.controls.martialArts.value,
      herbalism: this.controls.herbalism.value,
      rituals: this.controls.rituals.value,
      meditation: this.controls.meditation.value,
      craft: this.controls.craft.value,
      meleeThrowing: this.controls.meleeThrowing.value,
      rangedWeapons: this.controls.rangedWeapons.value,
      unarmed: this.controls.unarmed.value,
      throwing: this.controls.throwing.value,
      exoticWeapons: this.controls.exoticWeapons.value,
      willpowerMax: this.controls.willpowerMax.value,
      willpowerCurrent: this.controls.willpowerCurrent.value,
      impetusMax: this.controls.impetusMax.value,
      impetusCurrent: this.controls.impetusCurrent.value,
      vitalityDamage: this.controls.vitalityDamage.value,
      experience: this.toNullableText(this.controls.experience.value),
      equipment: this.toNullableText(this.controls.equipment.value),
      notes: this.toNullableText(this.controls.notes.value),
      activeRitualsEffects: this.toNullableText(this.controls.activeRitualsEffects.value),
      combatManeuvers: this.toNullableText(this.controls.combatManeuvers.value),
      arsenal: this.toNullableText(this.controls.arsenal.value),
      learnedRituals: this.toNullableText(this.controls.learnedRituals.value),
      craftDetails: this.toNullableText(this.controls.craftDetails.value)
    };
  }

  protected setTextValue(control: FormControl<string>, value: string): void {
    control.setValue(value);
    control.markAsDirty();
  }

  protected setRankValue(control: FormControl<number>, value: number): void {
    control.setValue(clampRank(Math.floor(value), 0, 5));
    control.markAsDirty();
  }

  protected setStaminaValue(value: number): void {
    const nextStaminaValue: number = clampRank(Math.floor(value), 0, 5);
    this.controls.stamina.setValue(nextStaminaValue);
    this.controls.stamina.markAsDirty();

    const maximumVitalityDamage: number = this.maximumVitalityDamage(nextStaminaValue);
    if (this.controls.vitalityDamage.value > maximumVitalityDamage) {
      this.controls.vitalityDamage.setValue(maximumVitalityDamage);
      this.controls.vitalityDamage.markAsDirty();
    }
  }

  protected setVitalityDamage(value: number): void {
    this.controls.vitalityDamage.setValue(value);
    this.controls.vitalityDamage.markAsDirty();
  }

  protected setWillpowerMaximum(maximumValue: number): void {
    this.setResourceMaximum(this.controls.willpowerMax, this.controls.willpowerCurrent, maximumValue);
  }

  protected setWillpowerCurrent(currentValue: number): void {
    this.setResourceCurrent(this.controls.willpowerCurrent, this.controls.willpowerMax, currentValue);
  }

  protected setImpetusMaximum(maximumValue: number): void {
    this.setResourceMaximum(this.controls.impetusMax, this.controls.impetusCurrent, maximumValue);
  }

  protected setImpetusCurrent(currentValue: number): void {
    this.setResourceCurrent(this.controls.impetusCurrent, this.controls.impetusMax, currentValue);
  }

  private setResourceMaximum(
    maximumControl: FormControl<number>,
    currentControl: FormControl<number>,
    maximumValue: number
  ): void {
    const nextMaximumValue: number = clampRank(Math.floor(maximumValue), 0, this.resourceSlots);
    maximumControl.setValue(nextMaximumValue);
    maximumControl.markAsDirty();

    if (currentControl.value > nextMaximumValue) {
      currentControl.setValue(nextMaximumValue);
      currentControl.markAsDirty();
    }
  }

  private setResourceCurrent(
    currentControl: FormControl<number>,
    maximumControl: FormControl<number>,
    currentValue: number
  ): void {
    currentControl.setValue(clampRank(Math.floor(currentValue), 0, maximumControl.value));
    currentControl.markAsDirty();
  }

  private toNullableText(value: string): string | null {
    const normalizedValue: string = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : null;
  }

  private maximumVitalityDamage(staminaValue: number): number {
    if (staminaValue >= 5) return 11;
    if (staminaValue >= 4) return 10;
    return 9;
  }
}
