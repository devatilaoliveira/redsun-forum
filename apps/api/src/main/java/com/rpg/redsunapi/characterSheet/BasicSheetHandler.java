package com.rpg.redsunapi.characterSheet;

import com.rpg.redsunapi.characterSheet.core.RuleCharacterSheetHandler;
import com.rpg.redsunapi.characterSheet.dto.BasicSheetDTO;
import com.rpg.redsunapi.tale.Tale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@Component
public class BasicSheetHandler implements RuleCharacterSheetHandler {

  private final BasicSheetRepository basicSheetRepository;

  public BasicSheetHandler(BasicSheetRepository basicSheetRepository) {
    this.basicSheetRepository = basicSheetRepository;
  }

  @Override
  public CharacterSheet getOrCreateSheet(Tale tale, UUID characterId) {
    if (tale == null || tale.getId() == null || characterId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tale and character id are required");
    }

    BasicSheet sheet = basicSheetRepository.findByTale_IdAndCharacterId(tale.getId(), characterId)
      .orElseGet(() -> basicSheetRepository.save(new BasicSheet(tale, characterId)));
    tale.addBasicSheet(sheet);
    return sheet;
  }

  @Override
  public boolean exists(Tale tale, UUID characterId) {
    if (tale == null || tale.getId() == null || characterId == null) {
      return false;
    }

    return basicSheetRepository.existsByTale_IdAndCharacterId(tale.getId(), characterId);
  }

  @Override
  public Object toResponseSheet(CharacterSheet sheet) {
    return BasicSheetDTO.from(requireBasicSheet(sheet));
  }

  @Override
  public void applyUpdate(CharacterSheet sheet, Object payload) {
    BasicSheet basicSheet = requireBasicSheet(sheet);
    Map<?, ?> values = requireObjectPayload(payload);

    if (values.containsKey("characterName")) {
      basicSheet.setCharacterName(normalizeOptionalText(values.get("characterName")));
    }
    if (values.containsKey("characterDescription")) {
      basicSheet.setCharacterDescription(normalizeOptionalText(values.get("characterDescription")));
    }
  }

  @Override
  public void save(CharacterSheet sheet) {
    basicSheetRepository.save(requireBasicSheet(sheet));
  }

  @Override
  public void deleteByTale(Tale tale) {
    if (tale == null || tale.getId() == null) {
      return;
    }

    basicSheetRepository.deleteByTaleId(tale.getId());
  }

  @Override
  public void deleteByTaleAndCharacterId(Tale tale, UUID characterId) {
    if (tale == null || tale.getId() == null || characterId == null) {
      return;
    }

    basicSheetRepository.deleteByTaleIdAndCharacterId(tale.getId(), characterId);
  }

  private BasicSheet requireBasicSheet(CharacterSheet sheet) {
    if (sheet instanceof BasicSheet basicSheet) {
      return basicSheet;
    }

    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected character sheet type");
  }

  private Map<?, ?> requireObjectPayload(Object payload) {
    if (payload instanceof Map<?, ?> values) {
      return values;
    }

    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected character sheet object.");
  }

  private String normalizeOptionalText(Object value) {
    if (value == null) {
      return null;
    }

    String text = Objects.toString(value, null);
    if (text == null || text.isBlank()) {
      return null;
    }

    return text;
  }
}
