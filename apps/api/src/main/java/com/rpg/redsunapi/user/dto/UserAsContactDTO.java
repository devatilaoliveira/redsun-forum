package com.rpg.redsunapi.user.dto;

import com.rpg.redsunapi.user.User;

public record UserAsContactDTO(
  String id,
  String username,
  String imageURL
) {

  public static UserAsContactDTO from(User user) {
    if (user == null) {
      return new UserAsContactDTO(null, null, null);
    }
    String id = user.getId() != null ? user.getId().toString() : null;
    if (user.isDeleted()) {
      return new UserAsContactDTO(id, null, null);
    }
    return new UserAsContactDTO(
      id,
      user.getUsername(),
      user.getImageURL()
    );
  }
}
