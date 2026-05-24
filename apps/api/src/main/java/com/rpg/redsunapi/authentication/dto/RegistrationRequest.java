package com.rpg.redsunapi.authentication.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegistrationRequest(
    @NotBlank(message = "Email is required") @Email(message = "Email must be valid") @Size(max = 254, message = "Email must not exceed 254 characters") String email,

    @NotBlank(message = "Password is required") @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters") String password,

    @NotNull(message = "Terms acknowledgement is required") @AssertTrue(message = "Terms must be accepted") Boolean acceptedTerms,

    @NotNull(message = "Privacy acknowledgement is required") @AssertTrue(message = "Privacy policy must be acknowledged") Boolean acknowledgedPrivacy) {

}
