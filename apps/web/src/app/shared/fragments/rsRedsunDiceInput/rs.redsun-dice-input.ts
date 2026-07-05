import {
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal
} from "@angular/core";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {RsInput} from "../rsInput/rs.input";
import {RsNumber} from "../rsNumber/rs.number";
import {UTIL_CONSTANTS} from "../../../../interface/constants/util.constants";

export interface RsRedsunDiceValue {
  action: string;
  difficulty: number;
  diceCount: number;
}

export type RsRedsunDiceListValue = RsRedsunDiceValue[];

const DEFAULT_ACTION: string = "";
const DEFAULT_DIFFICULTY: number = 0;
const DEFAULT_DICE_COUNT: number = 0;
const DEFAULT_DICE_ENTRIES: number = 4;
const D10_FACES: number = 10;
const MAX_ACTION_LENGTH: number = UTIL_CONSTANTS.EXTRA_SHORT_TEXT_LENGTH;
const MAX_DICE_COUNT: number = 10;

interface RedsunDicePostLabels {
  prefix: string;
  resultsLabel: string;
  difficultyLabel: string;
  diceLabel: string;
  successesLabel: string;
  criticalsLabel: string;
}

interface RedsunRollResult {
  rolls: number[];
  successes: number;
  criticals: number;
}

const normalizeAction = (action: string | null): string => {
  if (action == null) return DEFAULT_ACTION;
  return action.slice(0, MAX_ACTION_LENGTH);
};

const clampDifficulty = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_DIFFICULTY;
  const rounded: number = Math.floor(value);
  if (rounded <= 0) return DEFAULT_DIFFICULTY;
  if (rounded > D10_FACES) return D10_FACES;
  return rounded;
};

const normalizeDifficulty = (value: number | null): number => {
  if (value == null) return DEFAULT_DIFFICULTY;
  return clampDifficulty(value);
};

const normalizeDifficultyInput = (value: string): number => {
  if (!value.trim()) return DEFAULT_DIFFICULTY;
  return normalizeDifficulty(Number(value));
};

const clampDiceCount = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_DICE_COUNT;
  const rounded: number = Math.floor(value);
  if (rounded < 0) return 0;
  if (rounded > MAX_DICE_COUNT) return MAX_DICE_COUNT;
  return rounded;
};

const normalizeDiceCount = (value: number | null): number => {
  if (value == null) return DEFAULT_DICE_COUNT;
  return clampDiceCount(value);
};

const normalizeDiceCountInput = (value: string): number => {
  if (!value.trim()) return DEFAULT_DICE_COUNT;
  return normalizeDiceCount(Number(value));
};

const normalizeValue = (value: RsRedsunDiceValue | null): RsRedsunDiceValue => {
  const action: string = normalizeAction(value?.action ?? DEFAULT_ACTION);
  const difficulty: number = normalizeDifficulty(value?.difficulty ?? DEFAULT_DIFFICULTY);
  const diceCount: number = normalizeDiceCount(value?.diceCount ?? DEFAULT_DICE_COUNT);
  return {action, difficulty, diceCount};
};

const randomInt = (min: number, max: number): number => (
  Math.floor(Math.random() * (max - min + 1)) + min
);

const rollD10 = (count: number): number[] => {
  const total: number = Math.max(0, Math.floor(count));
  const results: number[] = [];
  for (let i = 0; i < total; i += 1) {
    results.push(randomInt(1, D10_FACES));
  }
  return results;
};

const calculateRedsunRoll = (rolls: number[], difficulty: number): RedsunRollResult => {
  let successes: number = 0;
  let criticals: number = 0;
  let removals: number = 0;

  for (const roll of rolls) {
    if (roll === 1) {
      removals += 1;
      continue;
    }

    if (roll >= difficulty) {
      successes += 1;
    }

    if (roll === D10_FACES) {
      criticals += 1;
    }
  }

  while (removals > 0 && criticals > 0) {
    criticals -= 1;
    successes -= 1;
    removals -= 1;
  }

  successes -= removals;

  return {rolls, successes, criticals};
};

@Component({
  selector: "rs-redsun-dice-input",
  standalone: true,
  imports: [RsInput, RsNumber, TranslatePipe],
  templateUrl: "./rs.redsun-dice-input.html",
  styleUrl: "./rs.redsun-dice-input.scss"
})
export class RsRedsunDiceInput {
  private static nextId: number = 0;
  private readonly uniqueId: string = `rs-redsun-dice-input-${RsRedsunDiceInput.nextId++}`;
  private readonly _translate: TranslateService = inject(TranslateService);
  private nextEntryId: number = 0;

  public readonly value: InputSignal<RsRedsunDiceListValue | null> = input<RsRedsunDiceListValue | null>(null);
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly id: InputSignal<string | null> = input<string | null>(null);

  public readonly valueChanged: OutputEmitterRef<RsRedsunDiceListValue> = output<RsRedsunDiceListValue>();

  protected readonly UTIL_CONSTANTS = UTIL_CONSTANTS;
  protected readonly entries: WritableSignal<RedsunDiceEntry[]> = signal<RedsunDiceEntry[]>([]);
  protected readonly baseId: Signal<string> = computed<string>(() => this.id() ?? this.uniqueId);

  constructor() {
    effect(() => {
      const normalized: RedsunDiceEntry[] = this.normalizeEntries(this.value());
      this.entries.set(normalized);
    });
  }

  protected onActionChange(entryId: number, value: string): void {
    if (this.disabled()) return;
    const nextAction: string = normalizeAction(value);
    const nextEntries: RedsunDiceEntry[] = this.entries().map((entry) => {
      if (entry.id !== entryId) return entry;
      return this.updateEntry(entry, {...entry.value, action: nextAction}, false);
    });
    this.setEntries(nextEntries);
  }

  protected onDifficultyChange(entryId: number, value: string): void {
    if (this.disabled()) return;
    const nextDifficulty: number = normalizeDifficultyInput(value);
    const nextEntries: RedsunDiceEntry[] = this.entries().map((entry) => {
      if (entry.id !== entryId) return entry;
      return this.updateEntry(entry, {...entry.value, difficulty: nextDifficulty}, true);
    });
    this.setEntries(nextEntries);
  }

  protected onDiceCountChange(entryId: number, value: string): void {
    if (this.disabled()) return;
    const nextCount: number = normalizeDiceCountInput(value);
    const nextEntries: RedsunDiceEntry[] = this.entries().map((entry) => {
      if (entry.id !== entryId) return entry;
      return this.updateEntry(entry, {...entry.value, diceCount: nextCount}, true);
    });
    this.setEntries(nextEntries);
  }

  public buildPostContent(values?: RsRedsunDiceListValue | null): string {
    const sourceValues: RsRedsunDiceListValue = values ?? this.entriesValue(this.entries());
    return this.buildPostContentFromValues(sourceValues);
  }

  public resetFields(): void {
    this.setEntries(this.createFixedEntries([], DEFAULT_DICE_ENTRIES));
  }

  protected actionId(entry: RedsunDiceEntry): string {
    return `${this.baseId()}-${entry.id}-action`;
  }

  protected difficultyId(entry: RedsunDiceEntry): string {
    return `${this.baseId()}-${entry.id}-difficulty`;
  }

  protected countId(entry: RedsunDiceEntry): string {
    return `${this.baseId()}-${entry.id}-count`;
  }

  protected difficultyValue(entry: RedsunDiceEntry): string {
    if (entry.value.difficulty <= 0) return "";
    return `${entry.value.difficulty}`;
  }

  protected diceCountValue(entry: RedsunDiceEntry): string {
    if (entry.value.diceCount <= 0) return "";
    return `${entry.value.diceCount}`;
  }

  private buildPostContentFromValues(values: RsRedsunDiceListValue): string {
    const labels: RedsunDicePostLabels = this.dicePostLabels();
    const lines: string[] = [];

    for (const entry of values) {
      const difficulty: number = normalizeDifficulty(entry.difficulty);
      const diceCount: number = normalizeDiceCount(entry.diceCount);
      if (difficulty <= 0 || diceCount <= 0) continue;

      const rollResult: RedsunRollResult = calculateRedsunRoll(rollD10(diceCount), difficulty);
      if (rollResult.rolls.length === 0) continue;

      const actionText: string = this.formatActionText(entry.action);
      lines.push(
        `${labels.prefix} | ${actionText} | ${labels.difficultyLabel}: ${difficulty} | ` +
        `${labels.diceLabel}: ${diceCount}d10 | ${labels.resultsLabel}: ${rollResult.rolls.join(", ")} | ` +
        `${labels.successesLabel}: ${rollResult.successes} | ${labels.criticalsLabel}: ${rollResult.criticals}`
      );
    }

    return lines.join("\n");
  }

  private dicePostLabels(): RedsunDicePostLabels {
    return {
      prefix: this._translate.instant("DICE_POST_PREFIX"),
      resultsLabel: this._translate.instant("DICE_POST_RESULTS"),
      difficultyLabel: this._translate.instant("REDSUN_DICE_POST_DIFFICULTY"),
      diceLabel: this._translate.instant("REDSUN_DICE_POST_DICE"),
      successesLabel: this._translate.instant("REDSUN_DICE_POST_SUCCESSES"),
      criticalsLabel: this._translate.instant("REDSUN_DICE_POST_CRITICALS")
    };
  }

  private formatActionText(action: string | null): string {
    const normalized: string = normalizeAction(action).trim();
    if (!normalized) return "-";
    return normalized;
  }

  private setEntries(entries: RedsunDiceEntry[]): void {
    this.entries.set(entries);
    this.valueChanged.emit(this.entriesValue(entries));
  }

  private entriesValue(entries: RedsunDiceEntry[]): RsRedsunDiceListValue {
    return entries.map((entry) => entry.value);
  }

  private normalizeEntries(value: RsRedsunDiceListValue | null): RedsunDiceEntry[] {
    this.nextEntryId = 0;
    const list: RsRedsunDiceListValue = Array.isArray(value) ? value : [];
    const normalizedList: RsRedsunDiceValue[] = list.slice(0, DEFAULT_DICE_ENTRIES).map((item) => normalizeValue(item));
    return this.createFixedEntries(normalizedList, DEFAULT_DICE_ENTRIES);
  }

  private createEntry(value?: RsRedsunDiceValue): RedsunDiceEntry {
    const normalized: RsRedsunDiceValue = normalizeValue(value ?? null);
    return {id: this.nextEntryId++, value: normalized, results: []};
  }

  private createFixedEntries(values: RsRedsunDiceValue[], count: number): RedsunDiceEntry[] {
    return Array.from({length: count}, (_, index) => this.createEntry(values[index]));
  }

  private updateEntry(entry: RedsunDiceEntry, value: RsRedsunDiceValue, reroll: boolean): RedsunDiceEntry {
    const normalized: RsRedsunDiceValue = normalizeValue(value);
    if (normalized.difficulty <= 0 || normalized.diceCount <= 0) {
      return {...entry, value: normalized, results: []};
    }

    if (!reroll) {
      return {...entry, value: normalized};
    }

    return {...entry, value: normalized, results: rollD10(normalized.diceCount)};
  }
}

interface RedsunDiceEntry {
  id: number;
  value: RsRedsunDiceValue;
  results: number[];
}
