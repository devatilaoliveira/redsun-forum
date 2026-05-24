package com.rpg.redsunapi.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AddContactByEmailRequestDTO(
  @NotBlank
  @Email
  String email
) {
}
