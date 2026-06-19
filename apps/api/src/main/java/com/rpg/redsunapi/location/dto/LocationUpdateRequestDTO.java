package com.rpg.redsunapi.location.dto;

import jakarta.validation.constraints.Size;
import org.springframework.lang.Nullable;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

public record LocationUpdateRequestDTO(
  @Nullable
  @Size(max = 120, message = "locationName must be 120 characters or fewer")
  String locationName,
  @Nullable @Size(max = 2000) String description,
  Optional<MultipartFile> image,
  @Nullable Boolean removeImage
) {
}
