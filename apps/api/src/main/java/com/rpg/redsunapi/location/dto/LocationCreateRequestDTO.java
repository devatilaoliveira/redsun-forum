package com.rpg.redsunapi.location.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

public record LocationCreateRequestDTO(
  @NotBlank @Size(max = 120) String locationName,
  @Size(max = 2000) String description,
  Optional<MultipartFile> image
) { }
