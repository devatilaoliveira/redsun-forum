package com.rpg.redsunapi.jwt;

import org.jspecify.annotations.Nullable;

import java.util.UUID;

public record VerifiedJwtPrincipal(UUID userId, String email, @Nullable String provider) {
}
