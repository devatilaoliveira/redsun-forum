package com.rpg.redsunapi.characterSheet;

import com.rpg.redsunapi.authentication.AuthenticatedUser;
import com.rpg.redsunapi.characterSheet.dto.CharacterSheetResponseDTO;
import com.rpg.redsunapi.characterSheet.dto.CharacterSheetUpsertRequestDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@Validated
@RequestMapping("/character-sheet")
public class CharacterSheetController {

  private final CharacterSheetService characterSheetService;

  public CharacterSheetController(CharacterSheetService characterSheetService) {
    this.characterSheetService = characterSheetService;
  }

  @GetMapping("/{taleId}")
  public ResponseEntity<CharacterSheetResponseDTO> getSheet(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable @NotNull UUID taleId,
    @RequestParam("characterSheetId") @NotNull UUID characterSheetId) {
    CharacterSheetResponseDTO dto = characterSheetService.getCharacterSheet(taleId, characterSheetId, principal.user());
    return ResponseEntity.ok(dto);
  }

  @PutMapping(value = "/{taleId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<CharacterSheetResponseDTO> putSheet(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable @NotNull UUID taleId,
    @RequestParam("characterSheetId") @NotNull UUID characterSheetId,
    @RequestPart("request") @NotNull @Valid CharacterSheetUpsertRequestDTO dto,
    @RequestPart(value = "avatar", required = false) MultipartFile avatar) throws IOException {
    CharacterSheetResponseDTO updated = characterSheetService.putSheet(taleId, characterSheetId, principal.user(), dto, avatar);
    return ResponseEntity.ok(updated);
  }
}
