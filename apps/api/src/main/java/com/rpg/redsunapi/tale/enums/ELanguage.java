package com.rpg.redsunapi.tale.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ELanguage {
  EN,
  DE,
  PT;

  @JsonCreator
  public static ELanguage from(String raw) {
    if (raw == null) {
      return null;
    }

    String value = raw.trim();
    if (value.isEmpty()) {
      throw new IllegalArgumentException("Language cannot be empty");
    }

    for (ELanguage language : values()) {
      if (language.name().equals(value)) {
        return language;
      }
    }

    throw new IllegalArgumentException("Invalid language value: " + raw);
  }
}
