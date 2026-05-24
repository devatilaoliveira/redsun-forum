package com.rpg.redsunapi.user.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddContactByIdRequestDTO(
  @NotNull UUID contactId
) {
}
