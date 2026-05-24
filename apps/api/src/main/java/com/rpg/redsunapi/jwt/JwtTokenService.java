package com.rpg.redsunapi.jwt;

import java.util.UUID;

public interface JwtTokenService {

  String generateToken(UUID userId, String email, String username);

  String extractUserId(String token);

  String extractEmail(String token);

  String extractName(String token);
}
