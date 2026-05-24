package com.rpg.redsunapi.user.dto;

import com.rpg.redsunapi.user.User;

import java.util.Objects;

public record LegalAcknowledgementDto(
    boolean termsAccepted,
    boolean privacyAcknowledged,
    boolean current,
    String termsVersion,
    String privacyVersion,
    String requiredTermsVersion,
    String requiredPrivacyVersion) {

  public static LegalAcknowledgementDto from(
      User user,
      String requiredTermsVersion,
      String requiredPrivacyVersion) {
    Objects.requireNonNull(user, "user");

    boolean termsAccepted = user.getTermsAcceptedAt() != null
        && requiredTermsVersion.equals(user.getTermsVersion());
    boolean privacyAcknowledged = user.getPrivacyAcknowledgedAt() != null
        && requiredPrivacyVersion.equals(user.getPrivacyVersion());

    return new LegalAcknowledgementDto(
        termsAccepted,
        privacyAcknowledged,
        termsAccepted && privacyAcknowledged,
        user.getTermsVersion(),
        user.getPrivacyVersion(),
        requiredTermsVersion,
        requiredPrivacyVersion
    );
  }
}
