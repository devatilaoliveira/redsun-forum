package com.rpg.redsunapi.characterSheet.core;

import com.rpg.redsunapi.characterSheet.BasicSheetHandler;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import org.springframework.stereotype.Component;

@Component
public class CharacterSheetHandlerRegistry {

  private final RuleCharacterSheetHandler basicSheetHandler;

  public CharacterSheetHandlerRegistry(BasicSheetHandler basicSheetHandler) {
    this.basicSheetHandler = basicSheetHandler;
  }

  public RuleCharacterSheetHandler resolve(ERuleSystem ruleSystem) {
    if (ruleSystem == null) {
      return basicSheetHandler;
    }

    return switch (ruleSystem) {
      case DND_5E,
           STORYTELLER,
           PATHFINDER_2E,
           BRP,
           GURPS,
           SWADE,
           OTHER,
           CUSTOM,
           FIM_DO_MUNDO -> basicSheetHandler;
    };
  }
}
