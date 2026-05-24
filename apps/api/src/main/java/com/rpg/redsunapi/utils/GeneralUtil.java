package com.rpg.redsunapi.utils;

import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.tale.enums.ERuleSystem;

import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;

public class GeneralUtil {
  public static String generateUniqueNumber() {
    long timestamp = System.currentTimeMillis() % 1_000_000;
    int randomPart = ThreadLocalRandom.current().nextInt(1000, 9999);
    return String.format("%06d%04d", timestamp, randomPart);
  }

  public static String normalizeEmail(String email) {
    return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
  }

  public static String trimRequired(String value) {
    return value.trim();
  }

  public static ELanguage parseRequiredLanguage(String language) {
    return ELanguage.from(trimRequired(language));
  }

  public static ERuleSystem parseRequiredRuleSystem(String rules) {
    return ERuleSystem.from(trimRequired(rules));
  }
}
