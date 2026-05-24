package com.rpg.redsunapi.tale.dto;

import com.rpg.redsunapi.characterSheet.BasicSheet;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.user.ERole;
import com.rpg.redsunapi.user.User;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class TaleParticipantProfileDTOTest {

  @Test
  void includesBasicSheetCharacterProfileFields() {
    UUID userId = UUID.randomUUID();
    BasicSheet sheet = new BasicSheet();
    sheet.setCharacterId(userId);
    sheet.setCharacterName("Mira");
    sheet.setCharacterImageUrl("https://example.com/mira.png");

    TaleParticipantProfileDTO dto = TaleParticipantProfileDTO.from(user(userId), tale(sheet));

    assertThat(dto.characterName()).isEqualTo("Mira");
    assertThat(dto.characterImageUrl()).isEqualTo("https://example.com/mira.png");
  }

  @Test
  void marksOwnerAsDmAndOtherParticipantsAsPlayers() {
    UUID ownerId = UUID.randomUUID();
    UUID playerId = UUID.randomUUID();
    Tale tale = tale(null);
    tale.setOwnerId(ownerId);

    TaleParticipantProfileDTO owner = TaleParticipantProfileDTO.from(user(ownerId), tale);
    TaleParticipantProfileDTO player = TaleParticipantProfileDTO.from(user(playerId), tale);

    assertThat(owner.role()).isEqualTo(ERole.DM);
    assertThat(player.role()).isEqualTo(ERole.PLAYER);
  }

  @Test
  void roleFollowsTransferredOwnership() {
    UUID previousOwnerId = UUID.randomUUID();
    UUID newOwnerId = UUID.randomUUID();
    Tale tale = tale(null);
    tale.setOwnerId(previousOwnerId);

    tale.setOwnerId(newOwnerId);

    TaleParticipantProfileDTO previousOwner = TaleParticipantProfileDTO.from(user(previousOwnerId), tale);
    TaleParticipantProfileDTO newOwner = TaleParticipantProfileDTO.from(user(newOwnerId), tale);

    assertThat(previousOwner.role()).isEqualTo(ERole.PLAYER);
    assertThat(newOwner.role()).isEqualTo(ERole.DM);
  }

  @Test
  void hidesCharacterFieldsForDeletedUsers() {
    UUID userId = UUID.randomUUID();
    BasicSheet sheet = new BasicSheet();
    sheet.setCharacterId(userId);
    sheet.setCharacterName("Mira");
    User user = user(userId);
    user.setDeleted(true);

    TaleParticipantProfileDTO dto = TaleParticipantProfileDTO.from(user, tale(sheet));

    assertThat(dto.id()).isEqualTo(userId.toString());
    assertThat(dto.username()).isNull();
    assertThat(dto.characterName()).isNull();
    assertThat(dto.characterImageUrl()).isNull();
    assertThat(dto.role()).isEqualTo(ERole.PLAYER);
  }

  private static User user(UUID id) {
    return new User(id, "player", "player@example.com", null, null, Set.of());
  }

  private static Tale tale(BasicSheet sheet) {
    Tale tale = new Tale();
    tale.addBasicSheet(sheet);
    return tale;
  }
}
