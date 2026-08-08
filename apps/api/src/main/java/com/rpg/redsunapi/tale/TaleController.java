package com.rpg.redsunapi.tale;

import com.rpg.redsunapi.authentication.AuthenticatedUser;
import com.rpg.redsunapi.tale.dto.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.UUID;

@RestController
@Validated
@RequestMapping("/tales")
@NullMarked
public class TaleController {

  private final TaleService taleService;
  private final TaleReadService taleReadService;

  public TaleController(TaleService taleService, TaleReadService taleReadService) {
    this.taleService = taleService;
    this.taleReadService = taleReadService;
  }

  @PostMapping(path = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<TaleDetailDTO> saveTale(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @Valid @ModelAttribute TaleCreateRequestDTO taleDTO
  ) throws IOException {
    return ResponseEntity.status(HttpStatus.CREATED).body(taleService.createTale(taleDTO, principal.user()));
  }

  @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<TaleDetailDTO> updateTale(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("id") UUID taleId,
    @Valid @NotNull @ModelAttribute TaleUpdateRequestDTO taleDTO
  ) throws IOException {
    return ResponseEntity.ok(taleService.updateTale(taleId, taleDTO, principal.user()));
  }

  @PostMapping("/{id}/archive")
  public ResponseEntity<Void> archiveTale(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("id") UUID taleId
  ) {
    taleService.archiveTale(taleId, principal.user());
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{id}")
  public ResponseEntity<TaleDetailDTO> getTale(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("id") UUID taleId
  ) {
    return ResponseEntity.ok(taleReadService.findTaleDetailById(taleId, principal.user()));
  }

  @PostMapping("/{taleId}/participants/{identifier}")
  public ResponseEntity<TaleDetailDTO> addParticipantByIdentifier(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("taleId") UUID taleId,
    @PathVariable("identifier") String identifier
  ) {
    return ResponseEntity.ok(taleService.addParticipantByIdentifier(taleId, identifier, principal.user()));
  }

  @DeleteMapping("/{taleId}/participants/{userId}")
  public ResponseEntity<TaleDetailDTO> removeParticipantById(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("taleId") UUID taleId,
    @PathVariable("userId") UUID userId
  ) {
    return ResponseEntity.ok(taleService.removeParticipantById(taleId, userId, principal.user()));
  }

  @DeleteMapping("/{taleId}/participants/me")
  public ResponseEntity<TaleDetailDTO> leaveTale(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("taleId") UUID taleId
  ) {
    return ResponseEntity.ok(taleService.removeSelfFromTale(taleId, principal.user()));
  }

  @PostMapping("/{taleId}/owner/{newOwnerId}")
  public ResponseEntity<TaleDetailDTO> transferOwnership(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("taleId") UUID taleId,
    @PathVariable("newOwnerId") UUID newOwnerId
  ) {
    return ResponseEntity.ok(taleService.transferOwnership(taleId, newOwnerId, principal.user()));
  }

  @GetMapping("/my-tales")
  public ResponseEntity<Page<TaleResponseDTO>> listUserTales(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @RequestParam(name = "page", defaultValue = "0") int page,
    @RequestParam(name = "size", defaultValue = "10") int size
  ) {
    return ResponseEntity.ok(taleService.findTalesForUser(principal.user(), page, size));
  }

  @GetMapping("/find-tales")
  public ResponseEntity<Page<TaleResponseDTO>> findPublicTales(
    @RequestParam(name = "page", defaultValue = "0") int page,
    @RequestParam(name = "size", defaultValue = "10") int size,
    @Nullable @RequestParam(name = "language", required = false) String language,
    @Nullable @RequestParam(name = "rules", required = false) String rules
  ) {
    return ResponseEntity.ok(taleService.findPublicTales(page, size, language, rules));
  }
}
