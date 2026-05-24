package com.rpg.redsunapi.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequestDto(
  @NotBlank(message = "Old password is required")
  @Size(min = 8, max = 100, message = "Old password must be between 8 and 100 characters")
  String oldPassword,

  @NotBlank(message = "New password is required")
  @Size(min = 8, max = 100, message = "New password must be between 8 and 100 characters")
  String newPassword
) {
}
