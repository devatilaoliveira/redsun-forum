package com.rpg.redsunapi.characterSheet;

import com.rpg.redsunapi.characterSheet.core.CharacterSheetHandlerRegistry;
import com.rpg.redsunapi.characterSheet.core.RuleCharacterSheetHandler;
import com.rpg.redsunapi.characterSheet.dto.BasicSheetUpsertDTO;
import com.rpg.redsunapi.characterSheet.dto.CharacterSheetResponseDTO;
import com.rpg.redsunapi.storage.CharacterStorageService;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.TaleRepository;
import com.rpg.redsunapi.tale.enums.ETaleStatus;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import com.rpg.redsunapi.user.User;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@NullMarked
public class CharacterSheetService {
  private static final Logger log = LoggerFactory.getLogger(CharacterSheetService.class);
  private static final String DEFAULT_CHARACTER_NAME = "no_given_name_yet";

  private final TaleRepository taleRepository;
  private final CharacterSheetHandlerRegistry handlerRegistry;
  private final BasicSheetHandler basicSheetHandler;
  private final RedSunSheetHandler redSunSheetHandler;
  private final CharacterStorageService characterStorageService;

  public CharacterSheetService(
    TaleRepository taleRepository,
    CharacterSheetHandlerRegistry handlerRegistry,
    BasicSheetHandler basicSheetHandler,
    RedSunSheetHandler redSunSheetHandler,
    CharacterStorageService characterStorageService
  ) {
    this.taleRepository = taleRepository;
    this.handlerRegistry = handlerRegistry;
    this.basicSheetHandler = basicSheetHandler;
    this.redSunSheetHandler = redSunSheetHandler;
    this.characterStorageService = characterStorageService;
  }

  @Transactional
  public CharacterSheetResponseDTO getCharacterSheet(UUID taleId, UUID characterSheetId, User requester) {
    Tale tale = requireActiveTale(taleId);
    requireCanRead(tale, requester.getId(), characterSheetId);

    RuleCharacterSheetHandler handler = resolveHandlerForCharacter(tale, characterSheetId);
    CharacterSheet sheet = handler.getOrCreateSheet(tale, characterSheetId);
    Object payload = handler.toResponseSheet(sheet);

    return new CharacterSheetResponseDTO(tale.getRules(), payload);
  }

  @Transactional
  public CharacterSheetResponseDTO putBasicSheet(
    UUID taleId,
    UUID characterSheetId,
    User requester,
    BasicSheetUpsertDTO request,
    @Nullable MultipartFile avatarFile
  ) throws IOException {
    return putSheet(
      taleId,
      characterSheetId,
      requester,
      avatarFile,
      false,
      basicSheetHandler,
      sheet -> basicSheetHandler.applyUpdate(sheet, request)
    );
  }

  @Transactional
  public CharacterSheetResponseDTO putRedSunSheet(
    UUID taleId,
    UUID characterSheetId,
    User requester,
    RedSunSheetUpsertDTO request,
    @Nullable MultipartFile avatarFile
  ) throws IOException {
    return putSheet(
      taleId,
      characterSheetId,
      requester,
      avatarFile,
      true,
      redSunSheetHandler,
      sheet -> redSunSheetHandler.applyUpdate(sheet, request)
    );
  }

  private CharacterSheetResponseDTO putSheet(
    UUID taleId,
    UUID characterSheetId,
    User requester,
    @Nullable MultipartFile avatarFile,
    boolean redSunEndpoint,
    RuleCharacterSheetHandler handler,
    SheetUpdater updater
  ) throws IOException {
    Tale tale = requireActiveTale(taleId);
    requireCanWrite(tale, requester.getId(), characterSheetId);
    requireMatchingSheetType(tale, characterSheetId, redSunEndpoint);
    if (isTaleOwner(tale, characterSheetId)) {
      redSunSheetHandler.deleteCompleteSheetDetails(tale, characterSheetId);
    }

    CharacterSheet sheet = handler.getOrCreateSheet(tale, characterSheetId);
    CharacterSheetChangeHistory.Snapshot beforeChanges = CharacterSheetChangeHistory.snapshot(sheet);
    @Nullable String oldAvatarUrl = sheet.getCharacterImageUrl();
    @Nullable String newAvatarUrl = null;
    boolean hasAvatarUpload = avatarFile != null && !avatarFile.isEmpty();
    @Nullable String effectiveCharacterImageUrl = oldAvatarUrl;

    try {
      if (hasAvatarUpload) {
        newAvatarUrl = characterStorageService.uploadCharacterImage(taleId, characterSheetId, avatarFile);
        effectiveCharacterImageUrl = newAvatarUrl;
      }

      updater.apply(sheet);
      sheet.setCharacterImageUrl(effectiveCharacterImageUrl);
      CharacterSheetChangeHistory.appendChanges(
        sheet,
        beforeChanges,
        CharacterSheetChangeHistory.snapshot(sheet),
        requester,
        Instant.now()
      );
      handler.save(sheet);

      if (hasAvatarUpload && oldAvatarUrl != null && !oldAvatarUrl.isBlank() && !Objects.equals(oldAvatarUrl, newAvatarUrl)) {
        try {
          characterStorageService.deleteCharacterImageByUrl(taleId, characterSheetId, oldAvatarUrl);
        } catch (Exception ex) {
          log.warn("Failed to delete old character image {} for sheet {}", oldAvatarUrl, characterSheetId, ex);
        }
      }
    } catch (Exception ex) {
      if (hasAvatarUpload && newAvatarUrl != null && !newAvatarUrl.isBlank() && !Objects.equals(oldAvatarUrl, newAvatarUrl)) {
        try {
          characterStorageService.deleteCharacterImageByUrl(taleId, characterSheetId, newAvatarUrl);
        } catch (Exception cleanupEx) {
          log.warn("Failed to cleanup uploaded character image {} for sheet {}", newAvatarUrl, characterSheetId, cleanupEx);
        }
      }
      throw ex;
    }

    Object payload = handler.toResponseSheet(sheet);
    return new CharacterSheetResponseDTO(tale.getRules(), payload);
  }

  private void requireMatchingSheetType(Tale tale, UUID characterSheetId, boolean redSunEndpoint) {
    if (isTaleOwner(tale, characterSheetId)) {
      if (redSunEndpoint) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tale owner only has a basic character sheet.");
      }
      return;
    }

    boolean taleUsesRedSun = tale.getRules() == ERuleSystem.REDSUN;
    if (taleUsesRedSun != redSunEndpoint) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Character sheet type does not match the tale rule system.");
    }
  }

  public void ensureCharacterSheetForParticipant(Tale tale, User participant) {
    if (participant == null || participant.getId() == null) {
      return;
    }

    if (isTaleOwner(tale, participant.getId())) {
      initializeCharacterSheetForTaleOwner(tale);
      return;
    }

    RuleCharacterSheetHandler handler = handlerRegistry.resolve(tale.getRules());
    if (handler.exists(tale, participant.getId())) {
      return;
    }

    CharacterSheet sheet = handler.getOrCreateSheet(tale, participant.getId());
    sheet.setCharacterName(DEFAULT_CHARACTER_NAME);
    handler.save(sheet);
  }

  public void initializeCharacterSheetForTaleOwner(Tale tale) {
    CharacterSheet sheet = basicSheetHandler.getOrCreateSheet(tale, tale.getOwnerId());
    sheet.setCharacterName(DEFAULT_CHARACTER_NAME);
    sheet.setCharacterImageUrl(tale.getImageURL());
    basicSheetHandler.save(sheet);
    redSunSheetHandler.deleteCompleteSheetDetails(tale, tale.getOwnerId());
  }

  public void resetCharacterSheetsForRuleChange(Tale tale) {
    basicSheetHandler.deleteByTale(tale);
    tale.getBasicSheets().clear();

    RuleCharacterSheetHandler handler = handlerRegistry.resolve(tale.getRules());
    Set<UUID> participantIds = new HashSet<>();
    if (tale.getParticipants() != null) {
      tale.getParticipants().stream()
        .filter(user -> user != null && user.getId() != null)
        .filter(user -> !isTaleOwner(tale, user.getId()))
        .map(user -> user.getId())
        .forEach(participantIds::add);
    }

    if (tale.getOwnerId() != null) {
      CharacterSheet ownerSheet = basicSheetHandler.getOrCreateSheet(tale, tale.getOwnerId());
      ownerSheet.setCharacterName(DEFAULT_CHARACTER_NAME);
      basicSheetHandler.save(ownerSheet);
    }

    for (UUID participantId : participantIds) {
      CharacterSheet sheet = handler.getOrCreateSheet(tale, participantId);
      sheet.setCharacterName(DEFAULT_CHARACTER_NAME);
      handler.save(sheet);
    }
  }

  public void removeCharacterSheetForParticipant(Tale tale, UUID participantId) {
    RuleCharacterSheetHandler handler = handlerRegistry.resolve(tale.getRules());
    handler.deleteByTaleAndCharacterId(tale, participantId);
    tale.removeBasicSheet(participantId);
  }

  public void handleOwnershipTransfer(Tale tale, UUID previousOwnerId, UUID newOwnerId) {
    if (previousOwnerId != null && !previousOwnerId.equals(newOwnerId) && isParticipant(tale, previousOwnerId)) {
      RuleCharacterSheetHandler participantHandler = resolveParticipantHandler(tale);
      CharacterSheet previousOwnerSheet = participantHandler.getOrCreateSheet(tale, previousOwnerId);
      if (previousOwnerSheet.getCharacterName() == null || previousOwnerSheet.getCharacterName().isBlank()) {
        previousOwnerSheet.setCharacterName(DEFAULT_CHARACTER_NAME);
      }
      participantHandler.save(previousOwnerSheet);
    }

    if (newOwnerId != null) {
      CharacterSheet newOwnerSheet = basicSheetHandler.getOrCreateSheet(tale, newOwnerId);
      if (newOwnerSheet.getCharacterName() == null || newOwnerSheet.getCharacterName().isBlank()) {
        newOwnerSheet.setCharacterName(DEFAULT_CHARACTER_NAME);
      }
      basicSheetHandler.save(newOwnerSheet);
      redSunSheetHandler.deleteCompleteSheetDetails(tale, newOwnerId);
    }
  }

  private Tale requireActiveTale(UUID taleId) {
    Tale tale = taleRepository.findById(taleId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));
    if (tale.getStatus() == ETaleStatus.SLEEP) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found");
    }
    return tale;
  }

  private void requireCanRead(Tale tale, UUID requesterId, UUID targetUserId) {
    if (requesterId.equals(tale.getOwnerId()) || requesterId.equals(targetUserId) || isParticipant(tale, requesterId)) {
      return;
    }

    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this character sheet.");
  }

  private void requireCanWrite(Tale tale, UUID requesterId, UUID targetUserId) {
    if (!requesterId.equals(tale.getOwnerId()) && !requesterId.equals(targetUserId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this character sheet.");
    }
  }

  private RuleCharacterSheetHandler resolveHandlerForCharacter(Tale tale, UUID characterId) {
    if (isTaleOwner(tale, characterId)) {
      redSunSheetHandler.deleteCompleteSheetDetails(tale, characterId);
      return basicSheetHandler;
    }

    return resolveParticipantHandler(tale);
  }

  private RuleCharacterSheetHandler resolveParticipantHandler(Tale tale) {
    return handlerRegistry.resolve(tale.getRules());
  }

  private boolean isTaleOwner(Tale tale, UUID userId) {
    return tale != null && userId != null && userId.equals(tale.getOwnerId());
  }

  private boolean isParticipant(Tale tale, UUID userId) {
    return tale != null
      && userId != null
      && tale.getParticipants() != null
      && tale.getParticipants().stream().anyMatch(user -> user != null && userId.equals(user.getId()));
  }

  @FunctionalInterface
  private interface SheetUpdater {
    void apply(CharacterSheet sheet);
  }
}
