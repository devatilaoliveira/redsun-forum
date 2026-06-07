package com.rpg.redsunapi.characterSheet;

import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

@NullMarked
final class CharacterSheetText {

  private CharacterSheetText() {
  }

  static @Nullable String normalizeOptionalText(@Nullable String value) {
    if (value == null || value.isBlank()) {
      return null;
    }

    return value;
  }
}
