package com.rpg.redsunapi.user;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum EThemeApplication {
  DARK("dark"),
  LIGHT("light");

  private final String value;

  EThemeApplication(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }

  @JsonCreator
  public static EThemeApplication from(String raw) {
    if (raw == null) {
      return null;
    }

    String value = raw.trim();
    if (value.isEmpty()) {
      throw new IllegalArgumentException("Theme cannot be empty");
    }

    for (EThemeApplication theme : values()) {
      if (theme.value.equals(value)) {
        return theme;
      }
    }

    throw new IllegalArgumentException("Invalid theme value: " + raw);
  }
}
