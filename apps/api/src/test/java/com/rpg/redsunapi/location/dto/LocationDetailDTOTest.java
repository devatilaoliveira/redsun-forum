package com.rpg.redsunapi.location.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rpg.redsunapi.location.Location;
import com.rpg.redsunapi.location.enums.ELocationStatus;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.user.User;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class LocationDetailDTOTest {

  @Test
  void omitsPostsFromSerializedDetails() throws Exception {
    UUID locationId = UUID.randomUUID();
    UUID taleId = UUID.randomUUID();
    UUID ownerId = UUID.randomUUID();
    OffsetDateTime lastTimeActive = OffsetDateTime.parse("2026-05-22T12:00:00Z");

    Location location = new Location();
    location.setId(locationId);
    location.setTaleId(taleId);
    location.setAuthor(new User(ownerId, "dm", "dm@example.com", null, null, Set.of()));
    location.setLocationName("Market Square");
    location.setDescription("A busy meeting place.");
    location.setImageURL("https://example.com/location.png");
    location.setLastTimeActive(lastTimeActive);
    location.setStatus(ELocationStatus.ACTIVE);

    Tale tale = new Tale();
    tale.setOwnerId(ownerId);

    JsonNode json = new ObjectMapper().findAndRegisterModules()
      .valueToTree(LocationDetailDTO.from(location, tale));

    assertThat(json.get("id").asText()).isEqualTo(locationId.toString());
    assertThat(json.get("taleId").asText()).isEqualTo(taleId.toString());
    assertThat(json.get("locationName").asText()).isEqualTo("Market Square");
    assertThat(json.has("posts")).isFalse();
  }
}
