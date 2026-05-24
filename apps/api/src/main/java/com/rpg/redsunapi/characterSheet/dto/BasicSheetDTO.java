package com.rpg.redsunapi.characterSheet.dto;

import com.rpg.redsunapi.characterSheet.BasicSheet;

public record BasicSheetDTO(
  String id,
  String characterId,
  String characterName,
  String characterDescription,
  String characterImageUrl
) {

  public static BasicSheetDTO from(BasicSheet sheet) {
    return new BasicSheetDTO(
      sheet.getId() != null ? sheet.getId().toString() : null,
      sheet.getCharacterId() != null ? sheet.getCharacterId().toString() : null,
      sheet.getCharacterName(),
      sheet.getCharacterDescription(),
      sheet.getCharacterImageUrl()
    );
  }
}
