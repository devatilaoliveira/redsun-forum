export class UtilFunctions {
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
}
