import {EVariant} from "../../interface/enums/EVariant";

export class UtilFunctions {
  private static readonly FOUR_HOURS_MS: number = 4 * 60 * 60 * 1000;
  private static readonly SEVEN_DAYS_MS: number = 7 * 24 * 60 * 60 * 1000;
  private static readonly THIRTY_DAYS_MS: number = 30 * 24 * 60 * 60 * 1000;

  public static getInitials(input: string | null | undefined): string {
    const trimmed: string = input?.trim() ?? "";
    if (!trimmed) return "RS";

    const parts: string[] = trimmed.split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      const normalized = parts[0].trim();
      if (!normalized) return "RS";

      const upper = normalized.slice(0, 2).toUpperCase();
      return upper.length === 1 ? upper.repeat(2) : upper;
    }

    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  public static getVariantByDate(input: string | Date | null | undefined): EVariant {
    if (!input) return EVariant.DANGER;

    const date: Date = input instanceof Date ? input : new Date(input);
    const timestamp: number = date.getTime();

    if (Number.isNaN(timestamp)) return EVariant.DANGER;

    const ageMs: number = Math.max(Date.now() - timestamp, 0);

    if (ageMs <= UtilFunctions.FOUR_HOURS_MS) return EVariant.SUCCESS;
    if (ageMs <= UtilFunctions.SEVEN_DAYS_MS) return EVariant.PRIMARY;
    if (ageMs <= UtilFunctions.THIRTY_DAYS_MS) return EVariant.WARNING;

    return EVariant.DANGER;
  }
}
