package com.rpg.redsunapi.tale.dto;

import com.rpg.redsunapi.characterSheet.BasicSheet;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.ETaleRole;
import com.rpg.redsunapi.user.User;

import java.util.UUID;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

@NullMarked
public record TaleParticipantProfileDTO(
  UUID id,
  String username,
  @Nullable String characterName,
  @Nullable String characterImageUrl,
  boolean isDeleted,
  ETaleRole role
) {

  public static TaleParticipantProfileDTO from(User user, Tale tale) {
    UUID userId = user.getId();
    ETaleRole role = tale.roleFor(userId);
    if (user.isDeleted()) {
      return new TaleParticipantProfileDTO(userId, "Deleted User", null, null, true, role);
    }

    BasicSheet sheet = basicSheetFor(tale, userId);
    return new TaleParticipantProfileDTO(
      userId,
      user.getUsername(),
      sheet != null ? sheet.getCharacterName() : null,
      characterImageUrlFor(sheet),
      false,
      role
    );
  }

  private static @Nullable BasicSheet basicSheetFor(Tale tale, UUID userId) {
    return tale.getBasicSheets().stream()
      .filter(sheet -> userId.equals(sheet.getCharacterId()))
      .findFirst()
      .orElse(null);
  }

  private static @Nullable String characterImageUrlFor(@Nullable BasicSheet sheet) {
    if (sheet == null) {
      return null;
    }

    return sheet.getCharacterImageUrl();
  }
}
