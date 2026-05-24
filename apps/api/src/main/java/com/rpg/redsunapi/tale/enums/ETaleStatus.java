package com.rpg.redsunapi.tale.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ETaleStatus {
  ACTIVE(1),
  INACTIVE(2),
  SLEEP(3);

  private final int value;

  ETaleStatus(int value) {
    this.value = value;
  }

  public int getValue() {
    return value;
  }

  @JsonCreator
  public static ETaleStatus from(Object raw) {
    if (raw == null) {
      return null;
    }

    String value = raw.toString().trim();
    if (value.isEmpty()) {
      throw new IllegalArgumentException("Status cannot be empty");
    }

    try {
      return ETaleStatus.valueOf(value.toUpperCase());
    } catch (IllegalArgumentException ex) {
      throw new IllegalArgumentException("Invalid status value: " + raw);
    }
  }

  @JsonValue
  public String toJson() {
    return name();
  }
}
