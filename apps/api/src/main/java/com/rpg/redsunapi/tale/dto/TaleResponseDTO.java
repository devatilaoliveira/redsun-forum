package com.rpg.redsunapi.tale.dto;

import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import com.rpg.redsunapi.tale.enums.ETaleStatus;

import java.time.OffsetDateTime;
public record TaleResponseDTO(
  String id,
  String taleName,
  Boolean isPublic,
  String description,
  String language,
  ETaleStatus status,
  String imageUrl,
  ERuleSystem rules,
  OffsetDateTime creationDate,
  OffsetDateTime lastTimeActive,
  int participantsCount
) {

  public static TaleResponseDTO from(Tale tale) {
    int participantsCount = tale.getParticipantsCount();

    OffsetDateTime creation = tale.getCreationDate() != null ? tale.getCreationDate() : OffsetDateTime.now();
    OffsetDateTime lastActive = tale.getLastTimeActive() != null ? tale.getLastTimeActive() : creation;
    ETaleStatus status = tale.getStatus() != null ? tale.getStatus() : ETaleStatus.ACTIVE;
    ERuleSystem rulesSystem = tale.getRules();

    return new TaleResponseDTO(
      tale.getId() != null ? tale.getId().toString() : null,
      tale.getTaleName(),
      tale.getPublic(),
      tale.getDescription(),
      tale.getLanguage(),
      status,
      tale.getImageURL(),
      rulesSystem,
      creation,
      lastActive,
      participantsCount
    );
  }
}
