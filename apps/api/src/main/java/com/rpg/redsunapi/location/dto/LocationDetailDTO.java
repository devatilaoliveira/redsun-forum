package com.rpg.redsunapi.location.dto;

import com.rpg.redsunapi.location.Location;
import com.rpg.redsunapi.location.enums.ELocationStatus;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.dto.TaleParticipantProfileDTO;

import java.time.OffsetDateTime;
import java.util.UUID;

public record LocationDetailDTO(
  String id,
  String taleId,
  UUID taleOwnerId,
  TaleParticipantProfileDTO author,
  String locationName,
  String description,
  String imageUrl,
  OffsetDateTime lastTimeActive,
  ELocationStatus status
) {

  public static LocationDetailDTO from(Location location, Tale tale) {
    OffsetDateTime lastTimeActive = location.getLastTimeActive() != null
      ? location.getLastTimeActive()
      : OffsetDateTime.now();
    String taleId = location.getTaleId() != null ? location.getTaleId().toString() : null;
    UUID taleOwnerId = tale != null ? tale.getOwnerId() : null;
    TaleParticipantProfileDTO author = TaleParticipantProfileDTO.from(location.getAuthor(), tale);
    return new LocationDetailDTO(
      location.getId() != null ? location.getId().toString() : null,
      taleId,
      taleOwnerId,
      author,
      location.getLocationName(),
      location.getDescription(),
      location.getImageURL(),
      lastTimeActive,
      location.getStatus()
    );
  }
}
