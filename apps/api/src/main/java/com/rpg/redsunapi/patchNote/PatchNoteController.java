package com.rpg.redsunapi.patchNote;

import com.rpg.redsunapi.patchNote.dto.PatchNoteResponseDTO;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/patch-notes")
public class PatchNoteController {

  private final PatchNoteService patchNoteService;

  public PatchNoteController(PatchNoteService patchNoteService) {
    this.patchNoteService = patchNoteService;
  }

  @GetMapping
  public ResponseEntity<Page<PatchNoteResponseDTO>> listPatchNotes(
    @RequestParam(name = "page", defaultValue = "0") @Min(0) int page,
    @RequestParam("language") PatchNoteLanguage language
  ) {
    return ResponseEntity.ok(patchNoteService.findPatchNotes(page, language));
  }
}
