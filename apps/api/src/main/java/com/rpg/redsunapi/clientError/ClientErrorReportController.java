package com.rpg.redsunapi.clientError;

import com.rpg.redsunapi.authentication.AuthenticatedUser;
import com.rpg.redsunapi.clientError.dto.ClientErrorReportRequestDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/client-errors")
public class ClientErrorReportController {

  private final ClientErrorReportService clientErrorReportService;

  public ClientErrorReportController(ClientErrorReportService clientErrorReportService) {
    this.clientErrorReportService = clientErrorReportService;
  }

  @PostMapping
  public ResponseEntity<Void> reportError(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @Valid @RequestBody ClientErrorReportRequestDTO request
  ) {
    clientErrorReportService.reportError(principal.user(), request);
    return ResponseEntity.noContent().build();
  }
}
