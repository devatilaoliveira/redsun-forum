package com.rpg.redsunapi.characterSheet;

import java.util.UUID;

public interface CharacterSheet {

  UUID getId();

  UUID getCharacterId();

  String getCharacterName();

  void setCharacterName(String characterName);

  String getCharacterImageUrl();

  void setCharacterImageUrl(String characterImageUrl);
}
