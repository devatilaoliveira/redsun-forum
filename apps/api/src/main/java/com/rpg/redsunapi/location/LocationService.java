package com.rpg.redsunapi.location;

import com.rpg.redsunapi.location.dto.LocationCreateRequestDTO;
import com.rpg.redsunapi.location.dto.LocationDetailDTO;
import com.rpg.redsunapi.location.enums.ELocationStatus;
import com.rpg.redsunapi.storage.LocationStorageService;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.TaleAccessPolicy;
import com.rpg.redsunapi.tale.TaleRepository;
import com.rpg.redsunapi.user.User;
import com.rpg.redsunapi.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
public class LocationService {

  private static final int MAX_PAGE_SIZE = 10;
  private static final Logger log = LoggerFactory.getLogger(LocationService.class);

  private final LocationRepository locationRepository;
  private final TaleRepository taleRepository;
  private final UserRepository userRepository;
  private final LocationStorageService locationStorageService;
  private final TaleAccessPolicy taleAccessPolicy;

  public LocationService(
    LocationRepository locationRepository,
    TaleRepository taleRepository,
    UserRepository userRepository,
    LocationStorageService locationStorageService,
    TaleAccessPolicy taleAccessPolicy) {
    this.locationRepository = locationRepository;
    this.taleRepository = taleRepository;
    this.userRepository = userRepository;
    this.locationStorageService = locationStorageService;
    this.taleAccessPolicy = taleAccessPolicy;
  }

  @Transactional
  public LocationDetailDTO addLocation(UUID taleId, LocationCreateRequestDTO request, User author) throws IOException {
    if (author == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
    }
    if (taleId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tale id is required");
    }

    Tale tale = taleRepository.findById(taleId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    taleAccessPolicy.ensureNotSleeping(tale);

    boolean isOwner = tale.getOwnerId() != null && tale.getOwnerId().equals(author.getId());
    boolean isParticipant = tale.getParticipants() != null && tale.getParticipants().stream()
      .anyMatch(user -> author.getId().equals(user.getId()));

    if (!isOwner && !isParticipant) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant of this tale");
    }

    User authorEntity = userRepository.findById(author.getId()).orElse(author);
    Location location = new Location();
    location.setTaleId(tale.getId());
    location.setLocationName(request.locationName());
    location.setAuthor(authorEntity);
    location.setDescription(request.description());
    location.setStatus(ELocationStatus.ACTIVE);
    location.setImageURL(null);

    OffsetDateTime timeNow = OffsetDateTime.now();
    location.setLastTimeActive(timeNow);

    boolean hasImage = request.image() != null && request.image().isPresent() && !request.image().get().isEmpty();
    Location savedLocation = locationRepository.save(location);

    if (!Objects.equals(timeNow, tale.getLastTimeActive())) {
      tale.setLastTimeActive(timeNow);
      taleRepository.save(tale);
    }

    if (hasImage) {
      String imageUrl = locationStorageService.uploadLocationImage(savedLocation.getId(), request.image().get());
      savedLocation.setImageURL(imageUrl);
    }

    return LocationDetailDTO.from(savedLocation, tale);
  }

  @Transactional(readOnly = true)
  public Location findLocationById(UUID locationId, User requester) {
    Location location = locationRepository.findById(locationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));

    Tale tale = loadTaleForLocation(location);
    taleAccessPolicy.ensureCanViewTale(tale, requester);
    return location;
  }

  @Transactional(readOnly = true)
  public Page<Location> findLocationsByTaleId(UUID taleId, User requester, int page, int size) {
    Tale tale = findTaleForView(taleId, requester);

    int safePage = Math.max(page, 0);
    int boundedSize = size <= 0 ? MAX_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
    Sort sort = Sort.by(Sort.Order.desc("lastTimeActive"), Sort.Order.desc("id"));
    Pageable pageable = PageRequest.of(safePage, boundedSize, sort);

    return locationRepository.findByTaleId(tale.getId(), pageable);
  }

  @Transactional
  public void deleteLocation(UUID locationId, User requester) {
    if (requester == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
    }

    Location location = locationRepository.findById(locationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));

    Tale tale = loadTaleForLocation(location);

    boolean isOwner = tale.getOwnerId() != null && tale.getOwnerId().equals(requester.getId());
    boolean isAuthor = location.getAuthor() != null && requester.getId().equals(location.getAuthor().getId());

    if (!isOwner && !isAuthor) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to delete this location");
    }

    String imageUrl = location.getImageURL();
    locationRepository.delete(location);

    if (imageUrl != null && !imageUrl.isBlank()) {
      try {
        locationStorageService.deleteLocation(locationId, imageUrl);
      } catch (Exception ex) {
        log.warn("Failed to delete location image {} for location {}", imageUrl, locationId, ex);
      }
    }
  }

  private Tale findTaleForView(UUID taleId, User requester) {
    Tale tale = taleRepository.findById(taleId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    taleAccessPolicy.ensureNotSleeping(tale);
    taleAccessPolicy.ensureCanViewTale(tale, requester);
    return tale;
  }

  private Tale loadTaleForLocation(Location location) {
    UUID taleId = location.getTaleId();
    if (taleId == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found");
    }

    Tale tale = taleRepository.findById(taleId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    taleAccessPolicy.ensureNotSleeping(tale);
    return tale;
  }
}
