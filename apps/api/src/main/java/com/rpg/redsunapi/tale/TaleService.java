package com.rpg.redsunapi.tale;

import com.rpg.redsunapi.characterSheet.CharacterSheetService;
import com.rpg.redsunapi.location.Location;
import com.rpg.redsunapi.location.LocationRepository;
import com.rpg.redsunapi.storage.LocationStorageService;
import com.rpg.redsunapi.storage.TaleStorageService;
import com.rpg.redsunapi.tale.dto.TaleCreateRequestDTO;
import com.rpg.redsunapi.tale.dto.TaleUpdateRequestDTO;
import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import com.rpg.redsunapi.tale.enums.ETaleStatus;
import com.rpg.redsunapi.user.User;
import com.rpg.redsunapi.user.UserRepository;
import com.rpg.redsunapi.utils.GeneralUtil;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@NullMarked
public class TaleService {

  private static final int MAX_PAGE_SIZE = 10;
  private static final Logger log = LoggerFactory.getLogger(TaleService.class);

  private final TaleRepository taleRepository;
  private final TaleStorageService taleStorageService;
  private final LocationRepository locationRepository;
  private final LocationStorageService locationStorageService;
  private final UserRepository userRepository;
  private final CharacterSheetService characterSheetService;

  public TaleService(
      TaleRepository taleRepository,
      TaleStorageService taleStorageService,
      LocationRepository locationRepository,
      LocationStorageService locationStorageService,
      UserRepository userRepository,
      CharacterSheetService characterSheetService) {
    this.taleRepository = taleRepository;
    this.taleStorageService = taleStorageService;
    this.locationRepository = locationRepository;
    this.locationStorageService = locationStorageService;
    this.userRepository = userRepository;
    this.characterSheetService = characterSheetService;
  }

  @Transactional
  public Tale createTale(TaleCreateRequestDTO taleDTO, User owner) throws IOException {
    Set<User> participants = new HashSet<>();
    List<String> ids = taleDTO.participantsIds();
    if (ids != null && !ids.isEmpty()) {
      for (String id : ids) {
        if (id == null || id.isBlank()) continue;
        UUID participantId = UUID.fromString(id);
        userRepository.findById(participantId).ifPresent(participants::add);
      }
    }
    User ownerEntity = userRepository.findById(owner.getId()).orElse(owner);
    participants.add(ownerEntity);

    OffsetDateTime dateNow = OffsetDateTime.now();
    ERuleSystem ruleSystem = ERuleSystem.from(taleDTO.rules());

    Tale tale = new Tale();
    tale.setTaleName(taleDTO.taleName());
    tale.setOwnerId(ownerEntity.getId());
    tale.setParticipants(participants);
    tale.setPublic(taleDTO.isPublic() != null ? taleDTO.isPublic() : Boolean.FALSE);
    tale.setImageURL(null);
    tale.setDescription(taleDTO.description());
    tale.setLanguage(taleDTO.language() == null ? null : GeneralUtil.trimRequired(taleDTO.language()));
    tale.setRules(ruleSystem);
    tale.setCreationDate(dateNow);
    tale.setLastTimeActive(dateNow);
    ETaleStatus status = taleDTO.status().orElse(ETaleStatus.ACTIVE);
    if (status == ETaleStatus.SLEEP) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot create a tale with status SLEEP");
    }
    tale.setStatus(status);
    boolean hasImage = taleDTO.image() != null && taleDTO.image().isPresent() && !taleDTO.image().get().isEmpty();

    Tale savedTale = taleRepository.save(tale);

    if (hasImage) {
      String imageUrl = taleStorageService.uploadTaleImage(savedTale.getId(), taleDTO.image().get());
      savedTale.setImageURL(imageUrl);
      savedTale = taleRepository.save(savedTale);
    }

    characterSheetService.initializeCharacterSheetForTaleOwner(savedTale);
    for (User participant : participants) {
      characterSheetService.ensureCharacterSheetForParticipant(savedTale, participant.getId());
    }

    return savedTale;
  }

  @Transactional
  public Tale updateTale(UUID taleId, TaleUpdateRequestDTO request, User requester) throws IOException {
    Tale tale = taleRepository.findById(taleId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    ensureNotSleeping(tale);

    if (tale.getOwnerId() == null || !tale.getOwnerId().equals(requester.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not the owner of this tale");
    }

    boolean hasUpdate = false;

    if (request.taleName() != null) {
      String normalizedName = request.taleName().trim();
      if (normalizedName.isEmpty()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tale name is required");
      }
      if (!normalizedName.equals(tale.getTaleName())) {
        tale.setTaleName(normalizedName);
        hasUpdate = true;
      }
    }

    if (request.description() != null && !Objects.equals(request.description(), tale.getDescription())) {
      tale.setDescription(request.description());
      hasUpdate = true;
    }

    if (request.language() != null) {
      String normalizedLanguage = GeneralUtil.trimRequired(request.language());
      if (!Objects.equals(normalizedLanguage, tale.getLanguage())) {
        tale.setLanguage(normalizedLanguage);
        hasUpdate = true;
      }
    }

    if (request.isPublic() != null && !Objects.equals(request.isPublic(), tale.getPublic())) {
      tale.setPublic(request.isPublic());
      hasUpdate = true;
    }

    if (request.status() != null && request.status().isPresent()) {
      ETaleStatus newStatus = request.status().get();
      if (newStatus == ETaleStatus.SLEEP) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use the archive endpoint to set status to SLEEP");
      }
      if (newStatus != tale.getStatus()) {
        tale.setStatus(newStatus);
        hasUpdate = true;
      }
    }

    if (request.rules() != null) {
      try {
        ERuleSystem rules = ERuleSystem.from(request.rules());
        if (rules != null && rules != tale.getRules()) {
          tale.setRules(rules);
          characterSheetService.resetCharacterSheetsForRuleChange(tale);
          hasUpdate = true;
        }
      } catch (IllegalArgumentException ex) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
      }
    }

    String oldImageUrl = tale.getImageURL();
    boolean hasImageUpdate = request.image() != null && request.image().isPresent() && !request.image().get().isEmpty();
    boolean removeImage = Boolean.TRUE.equals(request.removeImage());
    String newImageUrl = null;

    try {
      if (removeImage && hasImageUpdate) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot remove and update image at the same time");
      }

      if (removeImage) {
        tale.setImageURL(null);
        hasUpdate = true;
      }

      if (hasImageUpdate) {
        newImageUrl = taleStorageService.uploadTaleImage(tale.getId(), request.image().get());
        if (!Objects.equals(newImageUrl, oldImageUrl)) {
          tale.setImageURL(newImageUrl);
        }
        hasUpdate = true;
      }

      if (!hasUpdate) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No updates provided");
      }

      Tale saved = taleRepository.save(tale);

      if ((removeImage || hasImageUpdate)
        && oldImageUrl != null
        && !oldImageUrl.isBlank()
        && !Objects.equals(oldImageUrl, saved.getImageURL())) {
        try {
          taleStorageService.deleteTale(tale.getId(), oldImageUrl);
        } catch (Exception ex) {
          log.warn("Failed to delete old tale image {} for tale {}", oldImageUrl, taleId, ex);
        }
      }

      return saved;
    } catch (Exception ex) {
      if (hasImageUpdate && newImageUrl != null && !newImageUrl.isBlank() && !Objects.equals(newImageUrl, oldImageUrl)) {
        try {
          taleStorageService.deleteTale(tale.getId(), newImageUrl);
        } catch (Exception exception) {
          log.warn("Failed to cleanup newly uploaded tale image {}", newImageUrl, exception);
        }
      }
      throw ex;
    }
  }

  @Transactional
  public void archiveTale(UUID taleId, User requester) {
    Tale tale = taleRepository.findById(taleId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    ensureNotSleeping(tale);

    if (tale.getOwnerId() == null || !tale.getOwnerId().equals(requester.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not the owner of this tale");
    }

    OffsetDateTime now = OffsetDateTime.now();
    tale.setStatus(ETaleStatus.SLEEP);
    tale.setLastTimeActive(now);

    taleRepository.save(tale);
  }

  public Tale findTaleById(UUID taleId, User requester) {
    Tale tale = taleRepository.findById(taleId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    ensureNotSleeping(tale);

    if (Boolean.TRUE.equals(tale.getPublic())) {
      return tale;
    }

    if (tale.getOwnerId() != null && tale.getOwnerId().equals(requester.getId())) {
      return tale;
    }

    boolean isParticipant = tale.getParticipants() != null && tale.getParticipants().stream()
      .anyMatch(user -> requester.getId().equals(user.getId()));
    if (!isParticipant) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant of this tale");
    }

    return tale;
  }

  public Page<Tale> findTalesForUser(User user, int page, int size) {
    int safePage = Math.max(page, 0);
    int boundedSize = size <= 0 ? MAX_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
    Sort sort = Sort.by(Sort.Order.desc("lastTimeActive"), Sort.Order.desc("creationDate"));
    Pageable pageable = PageRequest.of(safePage, boundedSize, sort);

    return taleRepository.findAllByOwnerOrParticipant(user.getId(), pageable);
  }

  public Page<Tale> findPublicTales(int page, int size, @Nullable String language, @Nullable String rules) {
    int safePage = Math.max(page, 0);
    int boundedSize = size <= 0 ? MAX_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
    Sort sort = Sort.by(Sort.Order.desc("lastTimeActive"), Sort.Order.desc("creationDate"));
    Pageable pageable = PageRequest.of(safePage, boundedSize, sort);

    return taleRepository.findAllPublic(
        pageable,
        language == null ? null : parseLanguage(language),
        rules == null ? null : parseRules(rules));
  }

  @Transactional
  public int deleteSleepTalesOlderThan(OffsetDateTime cutoff) {
    List<Tale> talesToDelete = taleRepository.findAllSleepTalesOlderThan(cutoff);
    for (Tale tale : talesToDelete) {
      cleanupTaleAssets(tale);
    }

    return taleRepository.deleteSleepTalesOlderThan(cutoff);
  }

  private void cleanupTaleAssets(Tale tale) {
    try {
      if (tale.getImageURL() != null && !tale.getImageURL().isBlank()) {
        taleStorageService.deleteTale(tale.getId(), tale.getImageURL());
      }
      List<Location> locations = locationRepository.findByTaleId(tale.getId());
      for (Location location : locations) {
        if (location.getImageURL() != null && !location.getImageURL().isBlank()) {
          locationStorageService.deleteLocation(location.getId(), location.getImageURL());
        }
      }
    } catch (Exception ex) {
      log.warn("Failed to cleanup assets for tale {}", tale.getId(), ex);
    }
  }

  @Transactional
  public Tale addParticipantByIdentifier(UUID taleId, String identifier, User requester) {
    String normalizedIdentifier = identifier.trim();

    Tale tale = taleRepository.findById(taleId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    ensureNotSleeping(tale);

    if (!tale.getOwnerId().equals(requester.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not the owner of this tale");
    }

    User participant = normalizedIdentifier.contains("@")
      ? userRepository.findByEmail(normalizedIdentifier)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"))
      : userRepository.findByUsername(normalizedIdentifier)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    if (participant.isDeleted()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }

    Set<User> participants = tale.getParticipants();
    if (participants == null) {
      participants = new HashSet<>();
      tale.setParticipants(participants);
    }

    participants.add(participant);
    characterSheetService.ensureCharacterSheetForParticipant(tale, participant.getId());
    return taleRepository.save(tale);
  }

  @Transactional
  public Tale removeParticipantById(UUID taleId, UUID participantId, User requester) {
    Tale tale = taleRepository.findById(taleId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    ensureNotSleeping(tale);

    if (!tale.getOwnerId().equals(requester.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not the owner of this tale");
    }

    if (tale.getOwnerId() != null && tale.getOwnerId().equals(participantId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner cannot be removed");
    }

    Set<User> participants = tale.getParticipants();
    if (participants == null || participants.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Participant not found in tale");
    }

    boolean removed = participants.removeIf(participant -> participantId.equals(participant.getId()));
    if (!removed) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Participant not found in tale");
    }

    characterSheetService.removeCharacterSheetForParticipant(tale, participantId);
    return taleRepository.save(tale);
  }

  @Transactional
  public Tale removeSelfFromTale(UUID taleId, User requester) {
    Tale tale = taleRepository.findById(taleId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    ensureNotSleeping(tale);

    if (tale.getOwnerId() != null && tale.getOwnerId().equals(requester.getId())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Owner cannot leave the tale");
    }

    Set<User> participants = tale.getParticipants();
    if (participants == null || participants.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant of this tale");
    }

    boolean removed = participants.removeIf(participant -> requester.getId().equals(participant.getId()));
    if (!removed) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a participant of this tale");
    }

    characterSheetService.removeCharacterSheetForParticipant(tale, requester.getId());
    return taleRepository.save(tale);
  }

  @Transactional
  public Tale transferOwnership(UUID taleId, UUID newOwnerId, User requester) {
    Tale tale = taleRepository.findById(taleId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    ensureNotSleeping(tale);

    if (!tale.getOwnerId().equals(requester.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not the owner of this tale");
    }

    if (newOwnerId.equals(requester.getId())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New owner must be different from current owner");
    }

    Set<User> participants = tale.getParticipants();
    if (participants == null || participants.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Participant not found in tale");
    }

    User newOwner = participants.stream()
      .filter(Objects::nonNull)
      .filter(user -> newOwnerId.equals(user.getId()))
      .findFirst()
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Participant not found in tale"));

    if (newOwner.isDeleted()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }

    tale.setOwnerId(newOwnerId);

    return taleRepository.save(tale);
  }

  private void ensureNotSleeping(Tale tale) {
    if (tale.getStatus() == ETaleStatus.SLEEP) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found");
    }
  }

  private String parseLanguage(String language) {
    try {
      return GeneralUtil.parseRequiredLanguage(language).getValue();
    } catch (IllegalArgumentException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
    }
  }

  private ERuleSystem parseRules(String rules) {
    try {
      return GeneralUtil.parseRequiredRuleSystem(rules);
    } catch (IllegalArgumentException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
    }
  }
}
