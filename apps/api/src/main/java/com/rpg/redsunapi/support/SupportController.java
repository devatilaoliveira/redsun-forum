package com.rpg.redsunapi.support;

import com.rpg.redsunapi.authentication.AuthenticatedUser;
import com.rpg.redsunapi.support.dto.SupportRequestDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/support")
public class SupportController {

  private final SupportService supportService;

  public SupportController(SupportService supportService) {
    this.supportService = supportService;
  }

  @PostMapping
  public ResponseEntity<String> sendSupportMessage(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @Valid @RequestBody SupportRequestDTO request
  ) {
    supportService.sendSupportMessage(principal.user().getEmail(), request);
    return ResponseEntity.ok("Support message sent.");
  }
}
