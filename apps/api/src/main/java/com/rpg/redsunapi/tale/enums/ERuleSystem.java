package com.rpg.redsunapi.tale.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ERuleSystem {
  DND_5E(1),
  STORYTELLER(2),
  PATHFINDER_2E(3),
  BRP(4),
  GURPS(4),
  SWADE(6),
  OTHER(7),
  CUSTOM(8),
  FIM_DO_MUNDO(9);

  private final int value;

  ERuleSystem(int value) {
    this.value = value;
  }

  public int getValue() {
    return value;
  }

  @JsonCreator
  public static ERuleSystem from(Object raw) {
    if (raw == null) {
      return null;
    }

    String value = raw.toString().trim();
    if (value.isEmpty()) {
      throw new IllegalArgumentException("Rules cannot be empty");
    }

    try {
      return ERuleSystem.valueOf(value.toUpperCase());
    } catch (IllegalArgumentException ex) {
      throw new IllegalArgumentException("Invalid rule system value: " + raw);
    }
  }

  @JsonValue
  public String toJson() {
    return name();
  }
}
