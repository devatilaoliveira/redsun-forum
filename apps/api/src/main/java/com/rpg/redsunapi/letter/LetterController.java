package com.rpg.redsunapi.letter;

import com.rpg.redsunapi.authentication.AuthenticatedUser;
import com.rpg.redsunapi.letter.dto.LetterCreateRequestDTO;
import com.rpg.redsunapi.letter.dto.LetterDTO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@Validated
@RequestMapping("/letters")
public class LetterController {

  private final LetterService letterService;

  public LetterController(LetterService letterService) {
    this.letterService = letterService;
  }

  @PostMapping
  public ResponseEntity<LetterDTO> createLetter(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @Valid @RequestBody LetterCreateRequestDTO request
  ) {
    Letter letter = letterService.createLetter(request, principal.user());
    return ResponseEntity.status(HttpStatus.CREATED).body(LetterDTO.from(letter));
  }

  @GetMapping("/sent")
  public ResponseEntity<Page<LetterDTO>> listSentLetters(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @RequestParam(name = "page", defaultValue = "0") int page,
    @RequestParam(name = "size", defaultValue = "10") int size
  ) {
    Page<LetterDTO> letters = letterService.listSentLettersForUser(principal.user(), page, size)
      .map(LetterDTO::from);
    return ResponseEntity.ok(letters);
  }

  @GetMapping("/received")
  public ResponseEntity<Page<LetterDTO>> listReceivedLetters(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @RequestParam(name = "page", defaultValue = "0") int page,
    @RequestParam(name = "size", defaultValue = "10") int size
  ) {
    Page<LetterDTO> letters = letterService.listReceivedLettersForUser(principal.user(), page, size)
      .map(LetterDTO::from);
    return ResponseEntity.ok(letters);
  }

  @GetMapping("/{id}")
  public ResponseEntity<LetterDTO> getLetter(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("id") UUID letterId
  ) {
    Letter letter = letterService.findLetterById(letterId, principal.user());
    return ResponseEntity.ok(LetterDTO.from(letter));
  }
}
