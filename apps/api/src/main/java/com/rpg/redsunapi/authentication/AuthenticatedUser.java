package com.rpg.redsunapi.authentication;

import com.rpg.redsunapi.user.User;

import java.security.Principal;

public record AuthenticatedUser(User user) implements Principal {
  @Override
  public String getName() {
    return user.getEmail();
  }
}
