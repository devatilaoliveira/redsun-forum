package com.rpg.redsunapi.user.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

public record LegalAcknowledgementRequestDto(
    @NotNull(message = "Terms acknowledgement is required")
    @AssertTrue(message = "Terms must be accepted")
    Boolean acceptedTerms,

    @NotNull(message = "Privacy acknowledgement is required")
    @AssertTrue(message = "Privacy policy must be acknowledged")
    Boolean acknowledgedPrivacy) {
}
