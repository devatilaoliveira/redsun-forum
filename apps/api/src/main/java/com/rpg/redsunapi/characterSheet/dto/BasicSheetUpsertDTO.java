package com.rpg.redsunapi.characterSheet.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

@NullMarked
@JsonIgnoreProperties(ignoreUnknown = true)
public record BasicSheetUpsertDTO(
  @NotBlank(message = "Character name is required") String characterName,
  @Nullable String characterDescription
) {
}
