package com.rpg.redsunapi.tale;

import com.rpg.redsunapi.tale.enums.ERuleSystem;
import com.rpg.redsunapi.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TaleAccessPolicyTest {

  private final TaleAccessPolicy policy = new TaleAccessPolicy();

  @Test
  void publicVisitorCanReadExistingMemberSheet() {
    TestTale testTale = createTale(true);

    assertDoesNotThrow(() -> policy.ensureCanReadCharacterSheet(
      testTale.tale(),
      testTale.visitor().getId(),
      testTale.participant().getId()
    ));
  }

  @Test
  void publicVisitorCannotReadUnrelatedUserSheet() {
    TestTale testTale = createTale(true);

    ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
      policy.ensureCanReadCharacterSheet(
        testTale.tale(),
        testTale.visitor().getId(),
        testTale.visitor().getId()
      )
    );

    assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
  }

  @Test
  void privateTaleRejectsVisitorBeforeTargetLookup() {
    TestTale testTale = createTale(false);

    ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
      policy.ensureCanReadCharacterSheet(
        testTale.tale(),
        testTale.visitor().getId(),
        testTale.participant().getId()
      )
    );

    assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
  }

  @Test
  void participantCanWriteOwnSheetButNotAnotherParticipantsSheet() {
    TestTale testTale = createTale(false);
    User secondParticipant = user();
    testTale.tale().addParticipant(secondParticipant);

    assertDoesNotThrow(() -> policy.ensureCanWriteCharacterSheet(
      testTale.tale(),
      testTale.participant().getId(),
      testTale.participant().getId()
    ));

    ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
      policy.ensureCanWriteCharacterSheet(
        testTale.tale(),
        testTale.participant().getId(),
        secondParticipant.getId()
      )
    );

    assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
  }

  @Test
  void ownerCanWriteParticipantSheet() {
    TestTale testTale = createTale(false);

    assertDoesNotThrow(() -> policy.ensureCanWriteCharacterSheet(
      testTale.tale(),
      testTale.owner().getId(),
      testTale.participant().getId()
    ));
  }

  @Test
  void visitorCannotCreateOwnSheet() {
    TestTale testTale = createTale(true);

    ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
      policy.ensureCanWriteCharacterSheet(
        testTale.tale(),
        testTale.visitor().getId(),
        testTale.visitor().getId()
      )
    );

    assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
  }

  private TestTale createTale(boolean isPublic) {
    User owner = user();
    User participant = user();
    User visitor = user();
    Set<User> members = new HashSet<>(Set.of(owner, participant));
    Tale tale = new Tale(
      "Test tale",
      owner.getId(),
      members,
      isPublic,
      "Test tale description",
      null,
      ERuleSystem.OTHER
    );
    tale.setId(UUID.randomUUID());
    return new TestTale(tale, owner, participant, visitor);
  }

  private User user() {
    User user = new User();
    user.setId(UUID.randomUUID());
    return user;
  }

  private record TestTale(Tale tale, User owner, User participant, User visitor) {
  }
}
