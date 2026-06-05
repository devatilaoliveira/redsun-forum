package com.rpg.redsunapi.characterSheet.core;

import com.rpg.redsunapi.characterSheet.BasicSheetHandler;
import com.rpg.redsunapi.characterSheet.RedSunSheetHandler;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import org.springframework.stereotype.Component;

@Component
public class CharacterSheetHandlerRegistry {

  private final RuleCharacterSheetHandler basicSheetHandler;
  private final RuleCharacterSheetHandler redSunSheetHandler;

  public CharacterSheetHandlerRegistry(BasicSheetHandler basicSheetHandler, RedSunSheetHandler redSunSheetHandler) {
    this.basicSheetHandler = basicSheetHandler;
    this.redSunSheetHandler = redSunSheetHandler;
  }

  public RuleCharacterSheetHandler resolve(ERuleSystem ruleSystem) {
    if (ruleSystem == null) {
      return basicSheetHandler;
    }

    return switch (ruleSystem) {
      case DND,
           STORYTELLER,
           PATHFINDER,
           BRP,
           GURPS,
           SWADE,
           OTHER,
           CUSTOM,
           FIM_DO_MUNDO -> basicSheetHandler;
      case REDSUN -> redSunSheetHandler;
    };
  }
}
