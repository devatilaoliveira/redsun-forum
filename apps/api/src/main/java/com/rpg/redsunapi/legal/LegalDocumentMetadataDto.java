package com.rpg.redsunapi.legal;

public record LegalDocumentMetadataDto(
    String termsVersion,
    String privacyVersion,
    String termsRoute,
    String privacyRoute) {
}
