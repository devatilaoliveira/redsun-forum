package com.rpg.redsunapi.jwt;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Optional;

@Component
public class BearerTokenResolver {

  public Optional<String> resolve(HttpServletRequest request) {
    String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (authHeader == null || authHeader.isBlank()) {
      return Optional.empty();
    }

    if (!authHeader.toLowerCase(Locale.ROOT).startsWith("bearer ")) {
      throw new IllegalArgumentException("Invalid Authorization header");
    }

    return Optional.of(authHeader.substring(7));
  }
}
