package com.rpg.redsunapi.user.dto;

import jakarta.validation.constraints.NotBlank;

public record AddContactByIdentifierRequestDTO(
  @NotBlank String identifier
) {
}
