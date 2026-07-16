package com.rpg.redsunapi.tale.dto;

import com.rpg.redsunapi.location.dto.LocationDTO;
import com.rpg.redsunapi.location.Location;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import com.rpg.redsunapi.tale.enums.ETaleStatus;
import com.rpg.redsunapi.user.User;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

public record TaleDetailDTO(
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
  List<TaleParticipantProfileDTO> participants,
  TaleParticipantProfileDTO author,
  List<LocationDTO> locations
) {

  public static TaleDetailDTO from(Tale tale) {
    return fromInternal(tale, List.of(), null);
  }

  public static TaleDetailDTO fromWithRecentLocations(Tale tale, List<Location> locations, int maxLocations) {
    return fromInternal(tale, locations, maxLocations);
  }

  private static TaleDetailDTO fromInternal(Tale tale, List<Location> sourceLocations, Integer maxLocations) {
    OffsetDateTime creation = tale.getCreationDate() != null ? tale.getCreationDate() : OffsetDateTime.now();
    OffsetDateTime lastActive = tale.getLastTimeActive() != null ? tale.getLastTimeActive() : creation;
    ETaleStatus status = tale.getStatus() != null ? tale.getStatus() : ETaleStatus.ACTIVE;
    ERuleSystem rulesSystem = tale.getRules();
    ELanguage language = tale.getLanguage();

    List<TaleParticipantProfileDTO> participants = List.of();
    List<User> taleParticipants = tale.getParticipants() == null
      ? List.of()
      : tale.getParticipants().stream()
        .filter(Objects::nonNull)
        .toList();

    if (!taleParticipants.isEmpty()) {
      participants = taleParticipants.stream()
        .map(user -> TaleParticipantProfileDTO.from(user, tale))
        .toList();
    }

    TaleParticipantProfileDTO author = null;
    if (tale.getOwnerId() != null && !taleParticipants.isEmpty()) {
      author = taleParticipants.stream()
        .filter(user -> tale.isOwnedBy(user.getId()))
        .findFirst()
        .map(user -> TaleParticipantProfileDTO.from(user, tale))
        .orElse(null);
    }

    List<LocationDTO> locationDTOs = buildLocations(sourceLocations, maxLocations);

    return new TaleDetailDTO(
      tale.getId() != null ? tale.getId().toString() : null,
      tale.getTaleName(),
      tale.getPublic(),
      tale.getDescription(),
      language == null ? null : language.getValue(),
      status,
      tale.getImageURL(),
      rulesSystem,
      creation,
      lastActive,
      participants,
      author,
      locationDTOs
    );
  }

  private static List<LocationDTO> buildLocations(List<Location> locations, Integer maxLocations) {
    if (locations == null) {
      return List.of();
    }

    Comparator<Location> byLastActiveDesc = Comparator
      .comparing(Location::getLastTimeActive, Comparator.nullsFirst(Comparator.naturalOrder()))
      .reversed();

    Stream<Location> stream = locations.stream()
      .filter(Objects::nonNull);

    if (maxLocations != null) {
      stream = stream
        .sorted(byLastActiveDesc)
        .limit(maxLocations);
    }

    return stream
      .map(LocationDTO::from)
      .toList();
  }
}
