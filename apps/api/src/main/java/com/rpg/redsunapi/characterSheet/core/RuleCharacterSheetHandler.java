package com.rpg.redsunapi.characterSheet.core;

import com.rpg.redsunapi.characterSheet.CharacterSheet;
import com.rpg.redsunapi.tale.Tale;

import java.util.UUID;

public interface RuleCharacterSheetHandler {

  CharacterSheet getOrCreateSheet(Tale tale, UUID characterId);

  boolean exists(Tale tale, UUID characterId);

  Object toResponseSheet(CharacterSheet sheet);

  void applyUpdate(CharacterSheet sheet, Object payload);

  void save(CharacterSheet sheet);

  void deleteByTale(Tale tale);

  void deleteByTaleAndCharacterId(Tale tale, UUID characterId);
}
