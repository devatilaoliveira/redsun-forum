package com.rpg.redsunapi.user.dto;

import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import com.rpg.redsunapi.user.ERole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.lang.Nullable;

import java.util.List;

public record MeRequestDto(
  @NotBlank
  @Size(max = 25)
  @Pattern(regexp = "^[A-Za-z0-9]{1,25}$", message = "Username may contain only letters and numbers")
  String username,
  @Nullable @Size(max = 4000) String description,
  @Nullable @Size(max = 10) List<ELanguage> favoriteLanguage,
  @Nullable @Size(max = 10) List<ERuleSystem> favoriteRules,
  @Nullable @Size(max = 10) List<ERole> favoriteRole
) {
}
