package com.rpg.redsunapi.tale.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ERuleSystem {
  REDSUN(1),
  FIM_DO_MUNDO(2),
  DND(3),
  STORYTELLER(4),
  PATHFINDER(5),
  BRP(6),
  GURPS(7),
  SWADE(8),
  OTHER(9),
  CUSTOM(10);

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
