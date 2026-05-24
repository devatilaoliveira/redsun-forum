package com.rpg.redsunapi.characterSheet.dto;

import com.rpg.redsunapi.tale.enums.ERuleSystem;

public record CharacterSheetResponseDTO(
  ERuleSystem ruleSystem,
  Object sheet) {
}
