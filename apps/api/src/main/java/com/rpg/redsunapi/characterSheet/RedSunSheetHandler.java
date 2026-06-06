package com.rpg.redsunapi.characterSheet;

import com.rpg.redsunapi.characterSheet.core.RuleCharacterSheetHandler;
import com.rpg.redsunapi.tale.Tale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

import java.util.UUID;

@NullMarked
@Component
public class RedSunSheetHandler implements RuleCharacterSheetHandler {

  private final RedSunSheetRepository redSunSheetRepository;

  public RedSunSheetHandler(RedSunSheetRepository redSunSheetRepository) {
    this.redSunSheetRepository = redSunSheetRepository;
  }

  @Override
  public CharacterSheet getOrCreateSheet(Tale tale, UUID characterId) {
    RedSunSheet sheet = redSunSheetRepository.findByTale_IdAndCharacterId(tale.getId(), characterId)
      .orElseGet(() -> createRedSunSheet(tale, characterId));
    tale.addBasicSheet(sheet);
    return sheet;
  }

  @Override
  public boolean exists(Tale tale, UUID characterId) {
    return redSunSheetRepository.existsByTale_IdAndCharacterId(tale.getId(), characterId);
  }

  @Override
  public Object toResponseSheet(CharacterSheet sheet) {
    return RedSunSheetResponseDTO.from(requireRedSunSheet(sheet));
  }

  public void applyUpdate(CharacterSheet sheet, RedSunSheetUpsertDTO payload) {
    RedSunSheet redSunSheet = requireRedSunSheet(sheet);
    redSunSheet.setCharacterName(payload.characterName().trim());
    redSunSheet.setCharacterDescription(CharacterSheetText.normalizeOptionalText(payload.characterDescription()));
    applyRedSunUpdate(redSunSheet, payload);
  }

  @Override
  public void save(CharacterSheet sheet) {
    redSunSheetRepository.save(requireRedSunSheet(sheet));
  }

  @Override
  public void deleteByTale(Tale tale) {
    redSunSheetRepository.deleteAll(redSunSheetRepository.findAllByTale_Id(tale.getId()));
  }

  @Override
  public void deleteByTaleAndCharacterId(Tale tale, UUID characterId) {
    redSunSheetRepository.findByTale_IdAndCharacterId(tale.getId(), characterId)
      .ifPresent(redSunSheetRepository::delete);
  }

  public void ensureCompleteSheetDetails(Tale tale, UUID characterId) {
    if (tale == null || tale.getId() == null || characterId == null) {
      return;
    }

    redSunSheetRepository.ensureRedSunDetails(tale.getId(), characterId);
  }

  public void deleteCompleteSheetDetails(Tale tale, UUID characterId) {
    if (tale == null || tale.getId() == null || characterId == null) {
      return;
    }

    redSunSheetRepository.deleteRedSunDetails(tale.getId(), characterId);
  }

  private RedSunSheet createRedSunSheet(Tale tale, UUID characterId) {
    ensureCompleteSheetDetails(tale, characterId);
    return redSunSheetRepository.findByTale_IdAndCharacterId(tale.getId(), characterId)
      .orElseGet(() -> redSunSheetRepository.save(new RedSunSheet(tale, characterId)));
  }

  private RedSunSheet requireRedSunSheet(CharacterSheet sheet) {
    if (sheet instanceof RedSunSheet redSunSheet) {
      return redSunSheet;
    }

    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected character sheet type");
  }

  private void applyRedSunUpdate(RedSunSheet sheet, RedSunSheetUpsertDTO dto) {
    sheet.nature = CharacterSheetText.normalizeOptionalText(dto.nature());
    sheet.demeanor = CharacterSheetText.normalizeOptionalText(dto.demeanor());
    sheet.strength = rank(dto.strength());
    sheet.dexterity = rank(dto.dexterity());
    sheet.stamina = rank(dto.stamina());
    sheet.presence = rank(dto.presence());
    sheet.empathy = rank(dto.empathy());
    sheet.influence = rank(dto.influence());
    sheet.perception = rank(dto.perception());
    sheet.intellect = rank(dto.intellect());
    sheet.determination = rank(dto.determination());
    sheet.alertness = rank(dto.alertness());
    sheet.sports = rank(dto.sports());
    sheet.intuition = rank(dto.intuition());
    sheet.intimidation = rank(dto.intimidation());
    sheet.subterfuge = rank(dto.subterfuge());
    sheet.leadership = rank(dto.leadership());
    sheet.diplomacy = rank(dto.diplomacy());
    sheet.talent1Name = CharacterSheetText.normalizeOptionalText(dto.talent1Name());
    sheet.talent1Level = rank(dto.talent1Level());
    sheet.talent2Name = CharacterSheetText.normalizeOptionalText(dto.talent2Name());
    sheet.talent2Level = rank(dto.talent2Level());
    sheet.animalHandling = rank(dto.animalHandling());
    sheet.riding = rank(dto.riding());
    sheet.legerdemain = rank(dto.legerdemain());
    sheet.survival = rank(dto.survival());
    sheet.stealth = rank(dto.stealth());
    sheet.athletics = rank(dto.athletics());
    sheet.performance = rank(dto.performance());
    sheet.history = rank(dto.history());
    sheet.religion = rank(dto.religion());
    sheet.language = rank(dto.language());
    sheet.occultism = rank(dto.occultism());
    sheet.investigation = rank(dto.investigation());
    sheet.psychology = rank(dto.psychology());
    sheet.business = rank(dto.business());
    sheet.calling1Name = CharacterSheetText.normalizeOptionalText(dto.calling1Name());
    sheet.calling1Level = rank(dto.calling1Level());
    sheet.calling2Name = CharacterSheetText.normalizeOptionalText(dto.calling2Name());
    sheet.calling2Level = rank(dto.calling2Level());
    sheet.calling3Name = CharacterSheetText.normalizeOptionalText(dto.calling3Name());
    sheet.calling3Level = rank(dto.calling3Level());
    sheet.calling4Name = CharacterSheetText.normalizeOptionalText(dto.calling4Name());
    sheet.calling4Level = rank(dto.calling4Level());
    sheet.calling5Name = CharacterSheetText.normalizeOptionalText(dto.calling5Name());
    sheet.calling5Level = rank(dto.calling5Level());
    sheet.martialArts = rank(dto.martialArts());
    sheet.herbalism = rank(dto.herbalism());
    sheet.rituals = rank(dto.rituals());
    sheet.meditation = rank(dto.meditation());
    sheet.craft = rank(dto.craft());
    sheet.meleeThrowing = rank(dto.meleeThrowing());
    sheet.rangedWeapons = rank(dto.rangedWeapons());
    sheet.unarmed = rank(dto.unarmed());
    sheet.willpowerMax = resource(dto.willpowerMax());
    sheet.willpowerCurrent = resource(dto.willpowerCurrent());
    sheet.impetusMax = resource(dto.impetusMax());
    sheet.impetusCurrent = resource(dto.impetusCurrent());
    sheet.vitalityDamage = vitalityDamage(dto.vitalityDamage(), sheet.stamina);
    sheet.experience = CharacterSheetText.normalizeOptionalText(dto.experience());
    sheet.equipment = CharacterSheetText.normalizeOptionalText(dto.equipment());
    sheet.notes = CharacterSheetText.normalizeOptionalText(dto.notes());
    sheet.activeRitualsEffects = CharacterSheetText.normalizeOptionalText(dto.activeRitualsEffects());
    sheet.combatManeuvers = CharacterSheetText.normalizeOptionalText(dto.combatManeuvers());
    sheet.arsenal = CharacterSheetText.normalizeOptionalText(dto.arsenal());
    sheet.learnedRituals = CharacterSheetText.normalizeOptionalText(dto.learnedRituals());
    sheet.craftDetails = CharacterSheetText.normalizeOptionalText(dto.craftDetails());
  }

  private int rank(@Nullable Integer value) {
    return clamp(value, 0, 5);
  }

  private int resource(@Nullable Integer value) {
    return clamp(value, 0, 10);
  }

  private int vitalityDamage(@Nullable Integer value, int stamina) {
    int maximumDamage = stamina >= 5 ? 11 : stamina >= 4 ? 10 : 9;
    return clamp(value, 0, maximumDamage);
  }

  private int clamp(@Nullable Integer value, int minimum, int maximum) {
    int number = value != null ? value : minimum;
    return Math.max(minimum, Math.min(maximum, number));
  }
}
