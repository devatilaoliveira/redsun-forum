package com.rpg.redsunapi.tale.enums;

public enum ELanguage {
  EN("en"),
  DE("de"),
  PT("pt");

  private final String value;

  ELanguage(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }

  public static ELanguage from(String raw) {
    if (raw == null) {
      return null;
    }

    String value = raw.trim();
    if (value.isEmpty()) {
      throw new IllegalArgumentException("Language cannot be empty");
    }

    for (ELanguage language : values()) {
      if (language.value.equalsIgnoreCase(value)) {
        return language;
      }
    }

    throw new IllegalArgumentException("Invalid language value: " + raw);
  }
}
