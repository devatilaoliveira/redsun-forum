export interface RedSunSkillDTO {
  name: string | null;
  level: number;
}

export interface RedSunLimitedResourceDTO {
  maximumValue: number;
  currentValue: number;
}

export interface RedSunSheetDTO {
  identification: Record<string, string | null>;
  attributes: Record<string, number>;
  abilities: Record<string, RedSunSkillDTO>;
  advantages: Record<string, RedSunSkillDTO>;
  backgrounds: Record<string, string | null>;
  resources: Record<string, RedSunLimitedResourceDTO>;
  health: Record<string, boolean>;
  details: Record<string, string | null>;
}
