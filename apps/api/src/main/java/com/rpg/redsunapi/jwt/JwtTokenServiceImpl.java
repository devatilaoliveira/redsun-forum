package com.rpg.redsunapi.jwt;

import com.rpg.redsunapi.utils.GeneralUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Component
public class JwtTokenServiceImpl implements JwtTokenService {

  private final Key signingKey;
  private final long tokenExpiryHours;

  public JwtTokenServiceImpl(
      @Value("${JWT_SECRET_KEY}") String secretKey,
      @Value("${app.auth.token.expiry-hours:24}") long tokenExpiryHours) {
    this.signingKey = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    this.tokenExpiryHours = tokenExpiryHours;
  }

  @Override
  public String extractUserId(String token) {
    return extractClaims(token).getSubject();
  }

  @Override
  public String extractEmail(String token) {
    return extractClaims(token).get("email", String.class);
  }

  @Override
  public String extractName(String token) {
    Claims claims = extractClaims(token);
    Map<String, Object> userMetadata = claims.get("user_metadata", Map.class);
    if (userMetadata == null) {
      return "Adventurer" + GeneralUtil.generateUniqueNumber();
    }
    return (String) userMetadata.get("full_name");
  }

  public String generateToken(UUID userId, String email, String username) {
    Map<String, Object> userMetadata = Map.of("full_name", username);
    Instant now = Instant.now();
    Instant expiry = now.plus(tokenExpiryHours, ChronoUnit.HOURS);

    return Jwts.builder()
        .setSubject(userId.toString())
        .claim("email", email)
        .claim("user_metadata", userMetadata)
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(expiry))
        .signWith(signingKey)
        .compact();
  }

  private Claims extractClaims(String token) {
    return Jwts.parserBuilder()
      .setSigningKey(signingKey)
      .build()
      .parseClaimsJws(token)
      .getBody();
  }
}
