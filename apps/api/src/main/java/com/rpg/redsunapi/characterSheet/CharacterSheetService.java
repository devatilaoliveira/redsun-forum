package com.rpg.redsunapi.characterSheet;

import com.rpg.redsunapi.characterSheet.core.CharacterSheetHandlerRegistry;
import com.rpg.redsunapi.characterSheet.core.RuleCharacterSheetHandler;
import com.rpg.redsunapi.characterSheet.dto.CharacterSheetResponseDTO;
import com.rpg.redsunapi.characterSheet.dto.CharacterSheetUpsertRequestDTO;
import com.rpg.redsunapi.storage.CharacterStorageService;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.TaleRepository;
import com.rpg.redsunapi.tale.enums.ETaleStatus;
import com.rpg.redsunapi.user.User;
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
public class CharacterSheetService {
  private static final Logger log = LoggerFactory.getLogger(CharacterSheetService.class);

  private final TaleRepository taleRepository;
  private final CharacterSheetHandlerRegistry handlerRegistry;
  private final CharacterStorageService characterStorageService;

  public CharacterSheetService(
    TaleRepository taleRepository,
    CharacterSheetHandlerRegistry handlerRegistry,
    CharacterStorageService characterStorageService
  ) {
    this.taleRepository = taleRepository;
    this.handlerRegistry = handlerRegistry;
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
  public CharacterSheetResponseDTO putSheet(
    UUID taleId,
    UUID characterSheetId,
    User requester,
    CharacterSheetUpsertRequestDTO request,
    MultipartFile avatarFile
  ) throws IOException {
    Tale tale = requireActiveTale(taleId);
    requireCanAccess(tale, requester.getId(), characterSheetId);

    RuleCharacterSheetHandler handler = handlerRegistry.resolve(tale.getRules());
    CharacterSheet sheet = handler.getOrCreateSheet(tale, characterSheetId);
    String oldAvatarUrl = sheet.getCharacterImageUrl();
    String newAvatarUrl = null;
    boolean hasAvatarUpload = avatarFile != null && !avatarFile.isEmpty();
    String effectiveCharacterImageUrl = oldAvatarUrl;

    try {
      if (hasAvatarUpload) {
        newAvatarUrl = characterStorageService.uploadCharacterImage(taleId, characterSheetId, avatarFile);
        effectiveCharacterImageUrl = newAvatarUrl;
      }

      handler.applyUpdate(sheet, request.sheet());
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

  public void ensureCharacterSheetForParticipant(Tale tale, UUID participantId) {
    if (tale == null || tale.getId() == null || participantId == null) {
      return;
    }

    RuleCharacterSheetHandler handler = handlerRegistry.resolve(tale.getRules());
    if (handler.exists(tale, participantId)) {
      return;
    }

    handler.getOrCreateSheet(tale, participantId);
  }

  public void initializeCharacterSheetForTaleOwner(Tale tale) {
    if (tale == null || tale.getId() == null || tale.getOwnerId() == null) {
      return;
    }

    RuleCharacterSheetHandler handler = handlerRegistry.resolve(tale.getRules());
    CharacterSheet sheet = handler.getOrCreateSheet(tale, tale.getOwnerId());
    sheet.setCharacterName(tale.getTaleName());
    sheet.setCharacterImageUrl(tale.getImageURL());
    handler.save(sheet);
  }

  public void resetCharacterSheetsForRuleChange(Tale tale) {
    if (tale == null) {
      return;
    }

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
      handler.getOrCreateSheet(tale, participantId);
    }
  }

  public void removeCharacterSheetForParticipant(Tale tale, UUID participantId) {
    if (tale == null || participantId == null) {
      return;
    }

    if (tale.getId() == null) {
      return;
    }

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
}
