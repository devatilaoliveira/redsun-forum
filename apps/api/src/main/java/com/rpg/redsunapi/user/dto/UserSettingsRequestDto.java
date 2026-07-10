package com.rpg.redsunapi.user.dto;

import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.user.EThemeApplication;
import org.springframework.lang.Nullable;

public record UserSettingsRequestDto(
  @Nullable ELanguage appLanguage,
  @Nullable EThemeApplication appTheme
) {
}
