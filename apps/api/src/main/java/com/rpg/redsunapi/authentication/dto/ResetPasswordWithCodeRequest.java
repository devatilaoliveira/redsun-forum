package com.rpg.redsunapi.authentication.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordWithCodeRequest(
  @NotBlank(message = "Email is required")
  @Email(message = "Email must be valid")
  @Size(max = 254, message = "Email must not exceed 254 characters")
  String email,

  @NotBlank(message = "Code is required")
  @Pattern(regexp = "^\\d{6}$", message = "Code must be a 6-digit number")
  String code,

  @NotBlank(message = "Password is required")
  @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
  String newPassword
) {
}
