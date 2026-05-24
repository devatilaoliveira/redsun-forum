package com.rpg.redsunapi.tale;

import com.rpg.redsunapi.authentication.AuthenticatedUser;
import com.rpg.redsunapi.location.Location;
import com.rpg.redsunapi.location.LocationService;
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
  private final LocationService locationService;

  public TaleController(TaleService taleService, LocationService locationService) {
    this.taleService = taleService;
    this.locationService = locationService;
  }

  @PostMapping(path = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<TaleDetailDTO> saveTale(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @Valid @ModelAttribute TaleCreateRequestDTO taleDTO
  ) throws IOException {
    Tale savedTale = taleService.createTale(taleDTO, principal.user());
    return ResponseEntity.status(HttpStatus.CREATED).body(TaleDetailDTO.from(savedTale));
  }

  @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<TaleDetailDTO> updateTale(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("id") UUID taleId,
    @Valid @NotNull @ModelAttribute TaleUpdateRequestDTO taleDTO
  ) throws IOException {
    Tale updatedTale = taleService.updateTale(taleId, taleDTO, principal.user());
    return ResponseEntity.ok(TaleDetailDTO.from(updatedTale));
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
    Tale tale = taleService.findTaleById(taleId, principal.user());
    Page<Location> locations = locationService.findLocationsByTaleId(taleId, principal.user(), 0, 5);
    return ResponseEntity.ok(TaleDetailDTO.fromWithRecentLocations(tale, locations.getContent(), 5));
  }

  @PostMapping("/{taleId}/participants/{identifier}")
  public ResponseEntity<TaleDetailDTO> addParticipantByIdentifier(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("taleId") UUID taleId,
    @PathVariable("identifier") String identifier
  ) {
    Tale updated = taleService.addParticipantByIdentifier(taleId, identifier, principal.user());
    return ResponseEntity.ok(TaleDetailDTO.from(updated));
  }

  @DeleteMapping("/{taleId}/participants/{userId}")
  public ResponseEntity<TaleDetailDTO> removeParticipantById(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("taleId") UUID taleId,
    @PathVariable("userId") UUID userId
  ) {
    Tale updated = taleService.removeParticipantById(taleId, userId, principal.user());
    return ResponseEntity.ok(TaleDetailDTO.from(updated));
  }

  @DeleteMapping("/{taleId}/participants/me")
  public ResponseEntity<TaleDetailDTO> leaveTale(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("taleId") UUID taleId
  ) {
    Tale updated = taleService.removeSelfFromTale(taleId, principal.user());
    return ResponseEntity.ok(TaleDetailDTO.from(updated));
  }

  @PostMapping("/{taleId}/owner/{newOwnerId}")
  public ResponseEntity<TaleDetailDTO> transferOwnership(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("taleId") UUID taleId,
    @PathVariable("newOwnerId") UUID newOwnerId
  ) {
    Tale updated = taleService.transferOwnership(taleId, newOwnerId, principal.user());
    return ResponseEntity.ok(TaleDetailDTO.from(updated));
  }

  @GetMapping("/my-tales")
  public ResponseEntity<Page<TaleResponseDTO>> listUserTales(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @RequestParam(name = "page", defaultValue = "0") int page,
    @RequestParam(name = "size", defaultValue = "10") int size
  ) {
    Page<TaleResponseDTO> talesDTO = taleService.findTalesForUser(principal.user(), page, size).map(TaleResponseDTO::from);
    return ResponseEntity.ok(talesDTO);
  }

  @GetMapping("/find-tales")
  public ResponseEntity<Page<TaleResponseDTO>> findPublicTales(
    @RequestParam(name = "page", defaultValue = "0") int page,
    @RequestParam(name = "size", defaultValue = "10") int size,
    @Nullable @RequestParam(name = "language", required = false) String language,
    @Nullable @RequestParam(name = "rules", required = false) String rules
  ) {
    Page<TaleResponseDTO> tales = taleService.findPublicTales(page, size, language, rules).map(TaleResponseDTO::from);
    return ResponseEntity.ok(tales);
  }
}
