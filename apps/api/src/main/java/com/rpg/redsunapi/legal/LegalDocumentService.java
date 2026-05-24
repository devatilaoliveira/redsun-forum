package com.rpg.redsunapi.legal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LegalDocumentService {
  private final String termsVersion;
  private final String privacyVersion;

  public LegalDocumentService(
      @Value("${app.legal.terms-version:1.0}") String termsVersion,
      @Value("${app.legal.privacy-version:1.0}") String privacyVersion) {
    this.termsVersion = termsVersion;
    this.privacyVersion = privacyVersion;
  }

  public String currentTermsVersion() {
    return termsVersion;
  }

  public String currentPrivacyVersion() {
    return privacyVersion;
  }

  public LegalDocumentMetadataDto currentDocuments() {
    return new LegalDocumentMetadataDto(
        termsVersion,
        privacyVersion,
        "/terms",
        "/privacy"
    );
  }
}
