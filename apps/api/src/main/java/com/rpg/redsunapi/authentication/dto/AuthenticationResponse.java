package com.rpg.redsunapi.authentication.dto;

import java.util.UUID;

public record AuthenticationResponse(
        String token,
        UUID userId,
        String email) {
}
