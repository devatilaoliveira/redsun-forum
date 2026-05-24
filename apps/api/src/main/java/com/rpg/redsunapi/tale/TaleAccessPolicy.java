package com.rpg.redsunapi.tale;

import com.rpg.redsunapi.tale.enums.ETaleStatus;
import com.rpg.redsunapi.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class TaleAccessPolicy {

  public void ensureCanViewTale(Tale tale, User requester) {
    if (Boolean.TRUE.equals(tale.getPublic())) {
      return;
    }

    // Defensive programming, SecurityConfig already enforce authentication.
    if (requester == null) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant of this tale");
    }

    if (tale.getOwnerId() != null && tale.getOwnerId().equals(requester.getId())) {
      return;
    }

    boolean isParticipant = tale.getParticipants() != null && tale.getParticipants().stream()
      .anyMatch(user -> requester.getId().equals(user.getId()));
    if (!isParticipant) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant of this tale");
    }
  }

  public void ensureNotSleeping(Tale tale) {
    if (tale != null && tale.getStatus() == ETaleStatus.SLEEP) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found");
    }
  }
}
