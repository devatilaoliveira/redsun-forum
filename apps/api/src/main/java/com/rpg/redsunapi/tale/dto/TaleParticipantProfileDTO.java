package com.rpg.redsunapi.tale.dto;

import com.rpg.redsunapi.characterSheet.BasicSheet;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.user.ERole;
import com.rpg.redsunapi.user.User;

import java.util.UUID;

public record TaleParticipantProfileDTO(
  String id,
  String username,
  String characterName,
  String characterImageUrl,
  ERole role
) {

  public static TaleParticipantProfileDTO from(User user, Tale tale) {
    if (user == null) {
      return null;
    }

    UUID userId = user.getId();
    String id = userId != null ? userId.toString() : null;
    ERole role = roleFor(tale, userId);
    if (user.isDeleted()) {
      return new TaleParticipantProfileDTO(id, null, null, null, role);
    }

    BasicSheet sheet = basicSheetFor(tale, userId);
    return new TaleParticipantProfileDTO(
      id,
      user.getUsername(),
      sheet != null ? sheet.getCharacterName() : null,
      characterImageUrlFor(sheet),
      role
    );
  }

  private static ERole roleFor(Tale tale, UUID userId) {
    if (tale == null || userId == null) {
      return ERole.PLAYER;
    }

    return userId.equals(tale.getOwnerId()) ? ERole.DM : ERole.PLAYER;
  }

  private static BasicSheet basicSheetFor(Tale tale, UUID userId) {
    if (tale == null || userId == null || tale.getBasicSheets() == null) {
      return null;
    }

    return tale.getBasicSheets().stream()
      .filter(sheet -> sheet != null && userId.equals(sheet.getCharacterId()))
      .findFirst()
      .orElse(null);
  }

  private static String characterImageUrlFor(BasicSheet sheet) {
    if (sheet == null) {
      return null;
    }

    return blankToNull(sheet.getCharacterImageUrl());
  }

  private static String blankToNull(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }

    return value;
  }
}
