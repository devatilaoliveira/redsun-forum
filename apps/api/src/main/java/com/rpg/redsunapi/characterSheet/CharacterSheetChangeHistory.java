package com.rpg.redsunapi.characterSheet;

import com.rpg.redsunapi.user.User;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

@NullMarked
final class CharacterSheetChangeHistory {

  private CharacterSheetChangeHistory() {
  }

  static Snapshot snapshot(CharacterSheet sheet) {
    LinkedHashMap<String, @Nullable String> values = new LinkedHashMap<>();

    if (sheet instanceof BasicSheet basicSheet) {
      put(values, "Character Name", basicSheet.getCharacterName());
      put(values, "Character Description", basicSheet.getCharacterDescription());
    }

    if (sheet instanceof RedSunSheet redSunSheet) {
      put(values, "Nature", redSunSheet.nature);
      put(values, "Demeanor", redSunSheet.demeanor);
      put(values, "Strength", redSunSheet.strength);
      put(values, "Dexterity", redSunSheet.dexterity);
      put(values, "Stamina", redSunSheet.stamina);
      put(values, "Presence", redSunSheet.presence);
      put(values, "Empathy", redSunSheet.empathy);
      put(values, "Influence", redSunSheet.influence);
      put(values, "Perception", redSunSheet.perception);
      put(values, "Intellect", redSunSheet.intellect);
      put(values, "Determination", redSunSheet.determination);
      put(values, "Alertness", redSunSheet.alertness);
      put(values, "Sports", redSunSheet.sports);
      put(values, "Intuition", redSunSheet.intuition);
      put(values, "Intimidation", redSunSheet.intimidation);
      put(values, "Subterfuge", redSunSheet.subterfuge);
      put(values, "Leadership", redSunSheet.leadership);
      put(values, "Diplomacy", redSunSheet.diplomacy);
      put(values, "Talent 1 Name", redSunSheet.talent1Name);
      put(values, "Talent 1 Level", redSunSheet.talent1Level);
      put(values, "Talent 2 Name", redSunSheet.talent2Name);
      put(values, "Talent 2 Level", redSunSheet.talent2Level);
      put(values, "Animal Handling", redSunSheet.animalHandling);
      put(values, "Riding", redSunSheet.riding);
      put(values, "Legerdemain", redSunSheet.legerdemain);
      put(values, "Survival", redSunSheet.survival);
      put(values, "Stealth", redSunSheet.stealth);
      put(values, "Athletics", redSunSheet.athletics);
      put(values, "Performance", redSunSheet.performance);
      put(values, "History", redSunSheet.history);
      put(values, "Religion", redSunSheet.religion);
      put(values, "Language", redSunSheet.language);
      put(values, "Occultism", redSunSheet.occultism);
      put(values, "Investigation", redSunSheet.investigation);
      put(values, "Psychology", redSunSheet.psychology);
      put(values, "Business", redSunSheet.business);
      put(values, "Calling 1 Name", redSunSheet.calling1Name);
      put(values, "Calling 1 Level", redSunSheet.calling1Level);
      put(values, "Calling 2 Name", redSunSheet.calling2Name);
      put(values, "Calling 2 Level", redSunSheet.calling2Level);
      put(values, "Calling 3 Name", redSunSheet.calling3Name);
      put(values, "Calling 3 Level", redSunSheet.calling3Level);
      put(values, "Calling 4 Name", redSunSheet.calling4Name);
      put(values, "Calling 4 Level", redSunSheet.calling4Level);
      put(values, "Calling 5 Name", redSunSheet.calling5Name);
      put(values, "Calling 5 Level", redSunSheet.calling5Level);
      put(values, "Martial Arts", redSunSheet.martialArts);
      put(values, "Herbalism", redSunSheet.herbalism);
      put(values, "Rituals", redSunSheet.rituals);
      put(values, "Meditation", redSunSheet.meditation);
      put(values, "Craft", redSunSheet.craft);
      put(values, "Melee Throwing", redSunSheet.meleeThrowing);
      put(values, "Ranged Weapons", redSunSheet.rangedWeapons);
      put(values, "Unarmed", redSunSheet.unarmed);
      put(values, "Throwing", redSunSheet.throwing);
      put(values, "Exotic Weapons", redSunSheet.exoticWeapons);
      put(values, "Willpower Max", redSunSheet.willpowerMax);
      put(values, "Willpower Current", redSunSheet.willpowerCurrent);
      put(values, "Impetus Max", redSunSheet.impetusMax);
      put(values, "Impetus Current", redSunSheet.impetusCurrent);
      put(values, "Vitality Damage", redSunSheet.vitalityDamage);
      put(values, "Experience", redSunSheet.experience);
      put(values, "Equipment", redSunSheet.equipment);
      put(values, "Notes", redSunSheet.notes);
      put(values, "Active Rituals Effects", redSunSheet.activeRitualsEffects);
      put(values, "Combat Maneuvers", redSunSheet.combatManeuvers);
      put(values, "Arsenal", redSunSheet.arsenal);
      put(values, "Learned Rituals", redSunSheet.learnedRituals);
      put(values, "Craft Details", redSunSheet.craftDetails);
    }

    return new Snapshot(values);
  }

  static void appendChanges(CharacterSheet sheet, Snapshot before, Snapshot after, User requester, Instant changedAt) {
    if (!(sheet instanceof BasicSheet basicSheet)) {
      return;
    }

    String entry = buildEntry(before, after, requester, changedAt);
    if (entry.isBlank()) {
      return;
    }

    String existingHistory = basicSheet.getChangeHistory();
    if (existingHistory == null || existingHistory.isBlank()) {
      basicSheet.setChangeHistory(entry);
      return;
    }

    basicSheet.setChangeHistory(existingHistory.stripTrailing() + System.lineSeparator() + System.lineSeparator() + entry);
  }

  private static String buildEntry(Snapshot before, Snapshot after, User requester, Instant changedAt) {
    StringBuilder changes = new StringBuilder();
    for (Map.Entry<String, @Nullable String> entry : after.values().entrySet()) {
      @Nullable String oldValue = before.values().get(entry.getKey());
      @Nullable String newValue = entry.getValue();
      if (!Objects.equals(oldValue, newValue)) {
        changes
          .append("- ")
          .append(entry.getKey())
          .append(": ")
          .append(display(oldValue))
          .append(" -> ")
          .append(display(newValue))
          .append(System.lineSeparator());
      }
    }

    if (changes.length() == 0) {
      return "";
    }

    return "[%s] updatedBy=%s username=%s%n%s".formatted(
      changedAt,
      requester.getId(),
      display(requester.getUsername()),
      changes.toString().stripTrailing()
    );
  }

  private static void put(Map<String, @Nullable String> values, String name, @Nullable String value) {
    values.put(name, value);
  }

  private static void put(Map<String, @Nullable String> values, String name, int value) {
    values.put(name, Integer.toString(value));
  }

  private static String display(@Nullable String value) {
    if (value == null || value.isBlank()) {
      return "<empty>";
    }

    return value
      .replace("\\", "\\\\")
      .replace("\r", "\\r")
      .replace("\n", "\\n");
  }

  record Snapshot(Map<String, @Nullable String> values) {
  }
}
