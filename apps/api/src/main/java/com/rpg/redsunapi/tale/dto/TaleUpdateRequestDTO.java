package com.rpg.redsunapi.tale.dto;

import com.rpg.redsunapi.tale.enums.ETaleStatus;
import jakarta.validation.constraints.Size;
import org.springframework.lang.Nullable;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

public record TaleUpdateRequestDTO(
  @Nullable
  @Size(max = 120, message = "taleName must be 120 characters or fewer")
  String taleName,
  @Nullable Boolean isPublic,
  @Nullable @Size(max = 4000) String description,
  @Nullable @Size(max = 50) String language,
  Optional<MultipartFile> image,
  @Nullable Boolean removeImage,
  Optional<ETaleStatus> status,
  @Nullable String rules
) {
}
