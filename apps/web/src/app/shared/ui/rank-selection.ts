export function selectContiguousRank(
  currentValue: number,
  selectedValue: number,
  minimumValue: number
): number {
  const normalizedCurrentValue: number = Number.isFinite(currentValue) ? currentValue : minimumValue;
  const normalizedSelectedValue: number = Number.isFinite(selectedValue) ? selectedValue : minimumValue;

  if (normalizedSelectedValue === normalizedCurrentValue) {
    return Math.max(minimumValue, normalizedSelectedValue - 1);
  }

  return Math.max(minimumValue, normalizedSelectedValue);
}

export function clampRank(value: number, minimumValue: number, maximumValue: number): number {
  const normalizedMinimumValue: number = Number.isFinite(minimumValue) ? minimumValue : 0;
  const normalizedMaximumValue: number = Number.isFinite(maximumValue)
    ? Math.max(normalizedMinimumValue, maximumValue)
    : normalizedMinimumValue;
  const normalizedValue: number = Number.isFinite(value) ? value : normalizedMinimumValue;

  return Math.min(Math.max(normalizedValue, normalizedMinimumValue), normalizedMaximumValue);
}
