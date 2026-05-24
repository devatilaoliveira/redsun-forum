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
import {RsSelect} from "../rsSelect/rs.select";
import {RsNumber} from "../rsNumber/rs.number";
import {RsInput} from "../rsInput/rs.input";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";

export interface RsDiceValue {
  action: string;
  diceCount: number;
  diceType: string;
}
export type RsDiceListValue = RsDiceValue[];
const DICE_OPTIONS = {
  D2: "d2",
  D3: "d3",
  D4: "d4",
  D6: "d6",
  D8: "d8",
  D10: "d10",
  D12: "d12",
  D20: "d20",
  D100: "d100"
} as const;
const DICE_FACE_OPTIONS: number[] = [2, 3, 4, 6, 8, 10, 12, 20, 100];
const DEFAULT_DICE_TYPE: string = DICE_OPTIONS.D20;
const DEFAULT_DICE_COUNT: number = 0;
const DEFAULT_ACTION: string = "";
const DEFAULT_DICE_ENTRIES: number = 4;

interface DicePostLabels {
  prefix: string;
  resultsLabel: string;
  totalLabel: string;
}

const normalizeAction = (action: string | null): string => {
  if (action == null) return DEFAULT_ACTION;
  return action;
};

const clampDiceCount = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_DICE_COUNT;
  const rounded: number = Math.floor(value);
  if (rounded < 0) return 0;
  if (rounded > 99) return 99;
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

const normalizeDiceType = (value: string | null): string => {
  if (!value) return DEFAULT_DICE_TYPE;
  const normalized: string = value.trim().toLowerCase();
  const diceTypes: string[] = Object.values(DICE_OPTIONS) as string[];
  if (diceTypes.includes(normalized)) {
    return normalized;
  }
  if (!normalized.startsWith("d")) return DEFAULT_DICE_TYPE;
  const parsed: number = Number(normalized.slice(1));
  if (DICE_FACE_OPTIONS.includes(parsed)) {
    return `d${parsed}`;
  }
  return DEFAULT_DICE_TYPE;
};

const parseDiceFaces = (diceType: string): number | null => {
  const normalized: string = diceType.trim().toLowerCase();
  if (!normalized.startsWith("d")) return null;
  const parsed: number = Number(normalized.slice(1));
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
};

const randomInt = (min: number, max: number): number => (
  Math.floor(Math.random() * (max - min + 1)) + min
);

const rollDice = (count: number, faces: number): number[] => {
  const total: number = Math.max(0, Math.floor(count));
  const results: number[] = [];
  for (let i = 0; i < total; i += 1) {
    results.push(randomInt(1, faces));
  }
  return results;
};

const normalizeValue = (value: RsDiceValue | null): RsDiceValue => {
  const action: string = normalizeAction(value?.action ?? DEFAULT_ACTION);
  const diceCount: number = normalizeDiceCount(value?.diceCount ?? DEFAULT_DICE_COUNT);
  const diceType: string = normalizeDiceType(value?.diceType ?? DEFAULT_DICE_TYPE);
  return {action, diceCount, diceType};
};

@Component({
  selector: "rs-dice-input",
  standalone: true,
  imports: [RsSelect, RsNumber, RsInput, TranslatePipe],
  templateUrl: "./rs.dice-input.html",
  styleUrl: "./rs.dice-input.scss"
})
export class RsDiceInput {
  private static nextId: number = 0;
  private readonly uniqueId: string = `rs-dice-input-${RsDiceInput.nextId++}`;
  private readonly _translate: TranslateService = inject(TranslateService);
  private nextEntryId: number = 0;

  public readonly label: InputSignal<string | null> = input<string | null>(null);
  public readonly value: InputSignal<RsDiceListValue | null> = input<RsDiceListValue | null>(null);
  public readonly disabled: InputSignal<boolean> = input<boolean>(false);
  public readonly id: InputSignal<string | null> = input<string | null>(null);

  public readonly valueChanged: OutputEmitterRef<RsDiceListValue> = output<RsDiceListValue>();

  protected readonly entries: WritableSignal<DiceEntry[]> = signal<DiceEntry[]>([]);
  protected readonly baseId: Signal<string> = computed<string>(() => this.id() ?? this.uniqueId);
  protected readonly diceOptions = DICE_OPTIONS;
  protected readonly actionPlaceholderKeys: readonly string[] = [
    "DICE_ACTION_PLACEHOLDER_1",
    "DICE_ACTION_PLACEHOLDER_2",
    "DICE_ACTION_PLACEHOLDER_3",
    "DICE_ACTION_PLACEHOLDER_4"
  ];

  constructor() {
    effect(() => {
      const normalized: DiceEntry[] = this.normalizeEntries(this.value());
      this.entries.set(normalized);
    });
  }

  protected onActionChange(entryId: number, value: string): void {
    if (this.disabled()) return;
    const nextAction: string = normalizeAction(value);
    const nextEntries: DiceEntry[] = this.entries().map((entry) => {
      if (entry.id !== entryId) return entry;
      return this.updateEntry(entry, {...entry.value, action: nextAction}, false);
    });
    this.setEntries(nextEntries);
  }

  protected onDiceCountChange(entryId: number, value: string): void {
    if (this.disabled()) return;
    const nextCount: number = normalizeDiceCountInput(value);
    const nextEntries: DiceEntry[] = this.entries().map((entry) => {
      if (entry.id !== entryId) return entry;
      return this.updateEntry(entry, {...entry.value, diceCount: nextCount}, true);
    });
    this.setEntries(nextEntries);
  }

  protected onDiceTypeChange(entryId: number, value: string | null): void {
    if (this.disabled()) return;
    const nextType: string = normalizeDiceType(value);
    const nextEntries: DiceEntry[] = this.entries().map((entry) => {
      if (entry.id !== entryId) return entry;
      return this.updateEntry(entry, {...entry.value, diceType: nextType}, true);
    });
    this.setEntries(nextEntries);
  }

  public buildPostContent(values?: RsDiceListValue | null): string {
    const sourceValues: RsDiceListValue = values ?? this.entriesValue(this.entries());
    return this.buildPostContentFromValues(sourceValues);
  }

  public resetFields(): void {
    this.setEntries(this.createFixedEntries([], DEFAULT_DICE_ENTRIES));
  }

  private buildPostContentFromValues(values: RsDiceListValue): string {
    const labels: DicePostLabels = this.dicePostLabels();
    const lines: string[] = [];

    for (const entry of values) {
      const diceCount: number = normalizeDiceCount(entry.diceCount);
      if (diceCount <= 0) continue;

      const diceType: string = normalizeDiceType(entry.diceType);
      const faces: number | null = parseDiceFaces(diceType);
      if (faces == null) continue;

      const rolls: number[] = rollDice(diceCount, faces);
      if (rolls.length === 0) continue;

      const actionText: string = this.formatActionText(entry.action);
      const total: number = rolls.reduce((sum, value) => sum + value, 0);
      lines.push(`${labels.prefix} | ${actionText} | ${diceCount}${diceType} | ${labels.resultsLabel}: ${rolls.join(", ")} | ${labels.totalLabel}: ${total}`);
    }

    return lines.join("\n");
  }

  private dicePostLabels(): DicePostLabels {
    return {
      prefix: this._translate.instant("DICE_POST_PREFIX"),
      resultsLabel: this._translate.instant("DICE_POST_RESULTS"),
      totalLabel: this._translate.instant("DICE_POST_TOTAL")
    };
  }

  private formatActionText(action: string | null): string {
    const normalized: string = normalizeAction(action).trim();
    if (!normalized) return "-";
    return normalized;
  }

  protected actionId(entry: DiceEntry): string {
    return `${this.baseId()}-${entry.id}-action`;
  }

  protected countId(entry: DiceEntry): string {
    return `${this.baseId()}-${entry.id}-count`;
  }

  protected typeId(entry: DiceEntry): string {
    return `${this.baseId()}-${entry.id}-type`;
  }

  protected diceCountValue(entry: DiceEntry): string {
    return `${entry.value.diceCount}`;
  }

  protected firstActionId(): string {
    const first: DiceEntry | undefined = this.entries()[0];
    return first ? this.actionId(first) : `${this.baseId()}-action`;
  }

  protected actionPlaceholderKey(index: number): string {
    if (index < 0) return "DICE_ACTION_PLACEHOLDER_1";
    return this.actionPlaceholderKeys[index] ?? this.actionPlaceholderKeys[this.actionPlaceholderKeys.length - 1];
  }

  private setEntries(entries: DiceEntry[]): void {
    this.entries.set(entries);
    this.valueChanged.emit(this.entriesValue(entries));
  }

  private entriesValue(entries: DiceEntry[]): RsDiceListValue {
    return entries.map((entry) => entry.value);
  }

  private normalizeEntries(value: RsDiceListValue | null): DiceEntry[] {
    this.nextEntryId = 0;
    const list: RsDiceListValue = Array.isArray(value) ? value : [];
    const normalizedList: RsDiceValue[] = list.slice(0, DEFAULT_DICE_ENTRIES).map((item) => normalizeValue(item));
    return this.createFixedEntries(normalizedList, DEFAULT_DICE_ENTRIES);
  }

  private createEntry(value?: RsDiceValue): DiceEntry {
    const normalized: RsDiceValue = normalizeValue(value ?? null);
    return {id: this.nextEntryId++, value: normalized, results: []};
  }

  private createFixedEntries(values: RsDiceValue[], count: number): DiceEntry[] {
    return Array.from({length: count}, (_, index) => this.createEntry(values[index]));
  }

  private updateEntry(entry: DiceEntry, value: RsDiceValue, reroll: boolean): DiceEntry {
    const normalized: RsDiceValue = normalizeValue(value);
    if (normalized.diceCount <= 0) {
      return {...entry, value: normalized, results: []};
    }

    if (!reroll) {
      return {...entry, value: normalized};
    }

    const faces: number | null = parseDiceFaces(normalized.diceType);
    if (faces == null) {
      return {...entry, value: normalized, results: []};
    }

    return {...entry, value: normalized, results: rollDice(normalized.diceCount, faces)};
  }
}

interface DiceEntry {
  id: number;
  value: RsDiceValue;
  results: number[];
}
