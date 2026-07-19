package com.rpg.redsunapi.tale;

import com.rpg.redsunapi.tale.enums.ETaleStatus;
import com.rpg.redsunapi.user.User;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Component
public class TaleAccessPolicy {
  public void ensureCanViewTale(Tale tale, User requester) {
    if (!TaleMembership.of(tale, requester).canViewPublicOrMemberTale()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant of this tale");
    }
  }

  public void ensureCanManageTale(Tale tale, User requester) {
    if (!TaleMembership.of(tale, requester).isOwner()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not the owner of this tale");
    }
  }

  public void ensureCanParticipateInTale(Tale tale, User requester) {
    if (!TaleMembership.of(tale, requester).canWrite()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant of this tale");
    }
  }

  public void ensureCanModerateContent(Tale tale, User requester, @Nullable UUID authorId, String errorMessage) {
    if (!TaleMembership.of(tale, requester).canModerateAuthoredContent(authorId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, errorMessage);
    }
  }

  public void ensureCanReadCharacterSheet(Tale tale, UUID requesterId) {
    if (!TaleMembership.of(tale, requesterId).canViewPublicOrMemberTale()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this character sheet.");
    }
  }

  public void ensureCanWriteCharacterSheet(Tale tale, UUID requesterId, UUID characterSheetId) {
    if (!TaleMembership.of(tale, requesterId).canWriteCharacterSheet(characterSheetId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this character sheet.");
    }
  }

  public void ensureNotSleeping(Tale tale) {
    if (tale.getStatus() == ETaleStatus.SLEEP) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found");
    }
  }
}
