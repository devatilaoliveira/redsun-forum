package com.rpg.redsunapi.location.dto;

import com.rpg.redsunapi.location.Location;

import java.time.OffsetDateTime;

public record LocationDTO(
  String id,
  String authorId,
  String locationName,
  String lastTimeActive,
  int postsCount
) {

  public static LocationDTO from(Location location) {
    OffsetDateTime lastTimeActive = location.getLastTimeActive();
    String authorId = location.getAuthor() != null && location.getAuthor().getId() != null
      ? location.getAuthor().getId().toString()
      : null;
    return new LocationDTO(
      location.getId() != null ? location.getId().toString() : null,
      authorId,
      location.getLocationName(),
      lastTimeActive != null ? lastTimeActive.toString() : null,
      location.getPostsCount()
    );
  }
}
