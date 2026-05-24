package com.rpg.redsunapi.support.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SupportRequestDTO(
  @NotBlank(message = "Identification is required")
  @Size(max = 120, message = "Identification must not exceed 120 characters")
  String identification,

  @NotBlank(message = "Subject is required")
  @Size(max = 120, message = "Subject must not exceed 120 characters")
  String subject,

  @NotBlank(message = "Message is required")
  @Size(max = 4000, message = "Message must not exceed 4000 characters")
  String message
) {
}
