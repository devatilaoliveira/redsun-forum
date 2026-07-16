package com.rpg.redsunapi.user.dto;

import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import com.rpg.redsunapi.user.EFavoriteRole;
import com.rpg.redsunapi.user.User;

import java.util.List;

public record UserSearchResultDTO(
  String id,
  String username,
  String imageURL,
  String description,
  List<ELanguage> favoriteLanguage,
  List<ERuleSystem> favoriteRules,
  List<EFavoriteRole> favoriteRole
) {

  public static UserSearchResultDTO from(User user) {
    if (user == null) {
      return new UserSearchResultDTO(null, null, null, null, null, null, null);
    }
    String id = user.getId() != null ? user.getId().toString() : null;
    if (user.isDeleted()) {
      return new UserSearchResultDTO(id, null, null, null, null, null, null);
    }
    return new UserSearchResultDTO(
      id,
      user.getUsername(),
      user.getImageURL(),
      user.getDescription(),
      List.copyOf(user.getFavoriteLanguage()),
      List.copyOf(user.getFavoriteRules()),
      List.copyOf(user.getFavoriteRole())
    );
  }
}
