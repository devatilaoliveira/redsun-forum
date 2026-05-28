package com.rpg.redsunapi.authentication;

import com.fasterxml.jackson.annotation.JsonValue;
import org.jspecify.annotations.Nullable;

public enum Provider {
  EMAIL("email"),
  GOOGLE("google");

  private final String value;

  Provider(String value) {
    this.value = value;
  }

  public static Provider fromJwtProvider(@Nullable String provider) {
    if (provider == null || provider.isBlank()) {
      return EMAIL;
    }

    for (Provider candidate : values()) {
      if (candidate.value.equalsIgnoreCase(provider)) {
        return candidate;
      }
    }

    throw new IllegalArgumentException("Unsupported authentication provider: " + provider);
  }

  @JsonValue
  public String value() {
    return value;
  }
}
