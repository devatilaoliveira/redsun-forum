package com.rpg.redsunapi.characterSheet;

import com.rpg.redsunapi.characterSheet.core.CharacterSheetHandlerRegistry;
import com.rpg.redsunapi.characterSheet.core.RuleCharacterSheetHandler;
import com.rpg.redsunapi.storage.CharacterStorageService;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.TaleAccessPolicy;
import com.rpg.redsunapi.tale.TaleRepository;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import com.rpg.redsunapi.user.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CharacterSheetServiceTest {

  @Mock
  private TaleRepository taleRepository;

  @Mock
  private CharacterSheetHandlerRegistry handlerRegistry;

  @Mock
  private BasicSheetHandler basicSheetHandler;

  @Mock
  private RedSunSheetHandler redSunSheetHandler;

  @Mock
  private CharacterStorageService characterStorageService;

  @Mock
  private RuleCharacterSheetHandler ruleHandler;

  @Mock
  private CharacterSheet sheet;

  @Test
  void readingCharacterSheetNeverCreatesOne() {
    User owner = user();
    User participant = user();
    User visitor = user();
    Tale tale = new Tale(
      "Public tale",
      owner.getId(),
      new HashSet<>(Set.of(owner, participant)),
      true,
      "Public tale description",
      null,
      ERuleSystem.OTHER
    );
    UUID taleId = UUID.randomUUID();
    tale.setId(taleId);

    when(taleRepository.findById(taleId)).thenReturn(Optional.of(tale));
    when(handlerRegistry.resolve(ERuleSystem.OTHER)).thenReturn(ruleHandler);
    when(ruleHandler.getSheet(tale, participant.getId())).thenReturn(sheet);
    when(ruleHandler.toResponseSheet(sheet)).thenReturn(new Object());

    CharacterSheetService service = new CharacterSheetService(
      taleRepository,
      handlerRegistry,
      basicSheetHandler,
      redSunSheetHandler,
      characterStorageService,
      new TaleAccessPolicy()
    );

    service.getCharacterSheet(taleId, participant.getId(), visitor);

    verify(ruleHandler).getSheet(tale, participant.getId());
    verify(ruleHandler, never()).getOrCreateSheet(tale, participant.getId());
    verify(ruleHandler, never()).save(sheet);
  }

  private User user() {
    User user = new User();
    user.setId(UUID.randomUUID());
    return user;
  }
}
