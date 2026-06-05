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
    requireCanAccess(tale, requester.getId(), characterSheetId);

    RuleCharacterSheetHandler handler = handlerRegistry.resolve(tale.getRules());
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
    requireCanAccess(tale, requester.getId(), characterSheetId);
    requireMatchingRuleSystem(tale, redSunEndpoint);

    CharacterSheet sheet = handler.getOrCreateSheet(tale, characterSheetId);
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

  private void requireMatchingRuleSystem(Tale tale, boolean redSunEndpoint) {
    boolean taleUsesRedSun = tale.getRules() == ERuleSystem.REDSUN;
    if (taleUsesRedSun != redSunEndpoint) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Character sheet type does not match the tale rule system.");
    }
  }

  public void ensureCharacterSheetForParticipant(Tale tale, User participant) {
    RuleCharacterSheetHandler handler = handlerRegistry.resolve(tale.getRules());
    if (handler.exists(tale, participant.getId())) {
      return;
    }

    CharacterSheet sheet = handler.getOrCreateSheet(tale, participant.getId());
    sheet.setCharacterName(DEFAULT_CHARACTER_NAME);
    handler.save(sheet);
  }

  public void initializeCharacterSheetForTaleOwner(Tale tale) {
    RuleCharacterSheetHandler handler = handlerRegistry.resolve(tale.getRules());
    CharacterSheet sheet = handler.getOrCreateSheet(tale, tale.getOwnerId());
    sheet.setCharacterName(DEFAULT_CHARACTER_NAME);
    sheet.setCharacterImageUrl(tale.getImageURL());
    handler.save(sheet);
  }

  public void resetCharacterSheetsForRuleChange(Tale tale) {
    RuleCharacterSheetHandler handler = handlerRegistry.resolve(tale.getRules());
    handler.deleteByTale(tale);
    tale.getBasicSheets().clear();

    Set<UUID> participantIds = new HashSet<>();
    if (tale.getOwnerId() != null) {
      participantIds.add(tale.getOwnerId());
    }
    if (tale.getParticipants() != null) {
      tale.getParticipants().stream()
        .filter(user -> user != null && user.getId() != null)
        .map(user -> user.getId())
        .forEach(participantIds::add);
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

  private Tale requireActiveTale(UUID taleId) {
    Tale tale = taleRepository.findById(taleId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));
    if (tale.getStatus() == ETaleStatus.SLEEP) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found");
    }
    return tale;
  }

  private void requireCanAccess(Tale tale, UUID requesterId, UUID targetUserId) {
    if (!requesterId.equals(tale.getOwnerId()) && !requesterId.equals(targetUserId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot access this character sheet.");
    }
  }

  @FunctionalInterface
  private interface SheetUpdater {
    void apply(CharacterSheet sheet);
  }
}
