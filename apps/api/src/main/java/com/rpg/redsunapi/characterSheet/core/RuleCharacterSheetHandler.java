package com.rpg.redsunapi.characterSheet.core;

import com.rpg.redsunapi.characterSheet.CharacterSheet;
import com.rpg.redsunapi.tale.Tale;
import org.jspecify.annotations.NullMarked;

import java.util.UUID;

@NullMarked
public interface RuleCharacterSheetHandler {

  CharacterSheet getSheet(Tale tale, UUID characterId);

  CharacterSheet getOrCreateSheet(Tale tale, UUID characterId);

  boolean exists(Tale tale, UUID characterId);

  Object toResponseSheet(CharacterSheet sheet);

  void save(CharacterSheet sheet);

  void deleteByTale(Tale tale);

  void deleteByTaleAndCharacterId(Tale tale, UUID characterId);
}
