package com.rpg.redsunapi.user.dto;

import com.rpg.redsunapi.user.UserSettings;

import java.util.UUID;

public record UserSettingsDto(
  String appLanguage,
  String appTheme,
  boolean redirectToFavorite,
  UUID favoriteTaleId
) {
  public static UserSettingsDto from(UserSettings settings) {
    return new UserSettingsDto(
      settings.getAppLanguage().name(),
      settings.getAppTheme().getValue(),
      settings.isRedirectToFavorite(),
      settings.getFavoriteTale() == null ? null : settings.getFavoriteTale().getId()
    );
  }
}
