package com.rpg.redsunapi.tale.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddParticipantByEmailRequestDTO(
  @NotNull UUID taleId,
  @NotBlank @Email String email
) {
}
