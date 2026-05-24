package com.rpg.redsunapi.characterSheet.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CharacterSheetUpsertRequestDTO(
  @NotNull Object sheet) {
}
