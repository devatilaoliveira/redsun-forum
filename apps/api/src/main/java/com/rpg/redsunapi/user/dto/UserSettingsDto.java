package com.rpg.redsunapi.user.dto;

import com.rpg.redsunapi.user.UserSettings;

public record UserSettingsDto(
  String appLanguage,
  String appTheme,
  boolean redirectToFavorite
) {
  public static UserSettingsDto from(UserSettings settings) {
    return new UserSettingsDto(
      settings.getAppLanguage().name(),
      settings.getAppTheme().getValue(),
      settings.isRedirectToFavorite()
    );
  }
}
