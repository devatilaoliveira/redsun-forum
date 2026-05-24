package com.rpg.redsunapi.location;

import com.rpg.redsunapi.authentication.AuthenticatedUser;
import com.rpg.redsunapi.location.dto.LocationCreateRequestDTO;
import com.rpg.redsunapi.location.dto.LocationDTO;
import com.rpg.redsunapi.location.dto.LocationDetailDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.UUID;

@RestController
@Validated
@RequestMapping("/locations")
public class LocationController {

  private final LocationService locationService;
  private final LocationReadService locationReadService;

  public LocationController(LocationService locationService, LocationReadService locationReadService) {
    this.locationService = locationService;
    this.locationReadService = locationReadService;
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<LocationDetailDTO> createLocation(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @RequestParam("taleId") @NotNull UUID taleId,
    @Valid @ModelAttribute LocationCreateRequestDTO request
  ) throws IOException {
    LocationDetailDTO locationDetailDTO = locationService.addLocation(taleId, request, principal.user());
    return ResponseEntity.status(HttpStatus.CREATED).body(locationDetailDTO);
  }

  @GetMapping
  public ResponseEntity<Page<LocationDTO>> listLocations(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @RequestParam("taleId") @NotNull UUID taleId,
    @RequestParam(name = "page", defaultValue = "0") int page,
    @RequestParam(name = "size", defaultValue = "10") int size
  ) {
    Page<LocationDTO> locations = locationService.findLocationsByTaleId(taleId, principal.user(), page, size)
      .map(LocationDTO::from);
    return ResponseEntity.ok(locations);
  }

  @GetMapping("/{id}")
  public ResponseEntity<LocationDetailDTO> getLocation(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("id") UUID locationId
  ) {
    LocationDetailDTO locationDetailDTO = locationReadService.findLocationDetailById(locationId, principal.user());
    return ResponseEntity.ok(locationDetailDTO);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteLocation(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("id") UUID locationId
  ) {
    locationService.deleteLocation(locationId, principal.user());
    return ResponseEntity.ok().build();
  }
}
