package com.rpg.redsunapi.jwt;

import com.rpg.redsunapi.authentication.Provider;

import java.util.UUID;

public record VerifiedJwtPrincipal(UUID userId, String email, Provider provider) {
}
