package com.rpg.redsunapi.user.dto;

import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.user.EThemeApplication;
import com.rpg.redsunapi.user.UserSettings;

public record UserSettingsDto(
  String appLanguage,
  String appTheme
) {

  public static UserSettingsDto from(UserSettings settings) {
    if (settings == null) {
      return new UserSettingsDto(null, null);
    }

    ELanguage appLanguage = settings.getAppLanguage();
    EThemeApplication appTheme = settings.getAppTheme();

    return new UserSettingsDto(
      appLanguage == null ? null : appLanguage.name(),
      appTheme == null ? null : appTheme.getValue()
    );
  }
}
