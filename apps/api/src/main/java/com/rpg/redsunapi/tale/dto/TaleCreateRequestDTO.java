package com.rpg.redsunapi.tale.dto;

import com.rpg.redsunapi.tale.enums.ETaleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.lang.Nullable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public record TaleCreateRequestDTO(
  @Nullable String id,
  @NotBlank
  @Size(max = 120, message = "taleName must be 120 characters or fewer")
  String taleName,
  @Nullable List<String> participantsIds,
  @NotNull Boolean isPublic,
  @Size(max = 4000) String description,
  @Nullable @Size(max = 50, message = "language must be 50 characters or fewer") String language,
  Optional<MultipartFile> image,
  Optional<ETaleStatus> status,
  @NotNull String rules
) {

  public TaleCreateRequestDTO {
    participantsIds = participantsIds == null ? List.of() : participantsIds;
  }
}
