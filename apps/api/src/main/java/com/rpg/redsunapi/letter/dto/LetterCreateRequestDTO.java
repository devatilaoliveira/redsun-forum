package com.rpg.redsunapi.letter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record LetterCreateRequestDTO(
  @NotEmpty List<UUID> recipientsIds,
  @Size(max = 200) String subject,
  @NotBlank @Size(max = 4000) String content
) {

  public LetterCreateRequestDTO {
    recipientsIds = recipientsIds == null ? List.of() : recipientsIds;
  }
}
