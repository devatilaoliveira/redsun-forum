package com.rpg.redsunapi.clientError.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

public record ClientErrorReportRequestDTO(
  @NotBlank(message = "Message is required")
  @Size(max = 2000, message = "Message must not exceed 2000 characters")
  String message,

  @NotBlank(message = "Name is required")
  @Size(max = 200, message = "Name must not exceed 200 characters")
  String name,

  @Size(max = 10000, message = "Stack must not exceed 10000 characters")
  String stack,

  @Size(max = 2000, message = "Cause must not exceed 2000 characters")
  String cause,

  @Size(max = 1000, message = "Route must not exceed 1000 characters")
  String route,

  @Size(max = 20, message = "Method must not exceed 20 characters")
  String method,

  @Min(value = 100, message = "Status code must be at least 100")
  @Max(value = 599, message = "Status code must not exceed 599")
  Integer statusCode,

  @Size(max = 1000, message = "User agent must not exceed 1000 characters")
  String userAgent,

  @Size(max = 50, message = "Environment must not exceed 50 characters")
  String environment,

  OffsetDateTime timestamp,

  @Size(max = 4000, message = "Metadata must not exceed 4000 characters")
  String metadata
) {
}
