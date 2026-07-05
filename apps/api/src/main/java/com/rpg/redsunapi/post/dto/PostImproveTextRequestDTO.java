package com.rpg.redsunapi.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostImproveTextRequestDTO(
  @NotBlank
  @Size(max = 2000)
  String content
) {
}
