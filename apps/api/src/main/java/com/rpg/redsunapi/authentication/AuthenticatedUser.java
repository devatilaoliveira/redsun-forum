package com.rpg.redsunapi.authentication;

import com.rpg.redsunapi.user.User;

import java.security.Principal;

public record AuthenticatedUser(User user, boolean newlyCreated) implements Principal {
  @Override
  public String getName() {
    return user.getEmail();
  }
}
