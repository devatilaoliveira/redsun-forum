package com.rpg.redsunapi.legal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/legal/documents")
public class LegalDocumentController {
  private final LegalDocumentService legalDocumentService;

  public LegalDocumentController(LegalDocumentService legalDocumentService) {
    this.legalDocumentService = legalDocumentService;
  }

  @GetMapping("/current")
  public ResponseEntity<LegalDocumentMetadataDto> currentDocuments() {
    return ResponseEntity.ok(legalDocumentService.currentDocuments());
  }
}
