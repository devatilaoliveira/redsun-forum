package com.rpg.redsunapi.jwt;

import com.rpg.redsunapi.authentication.Provider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;
import org.jspecify.annotations.Nullable;

import java.util.Map;
import java.util.UUID;

@Component
public class JwtPrincipalResolver {

  private final JwtDecoder supabaseJwtDecoder;

  public JwtPrincipalResolver(@Value("${supabase.url}") String supabaseUrl) {
    this(createSupabaseJwtDecoder(supabaseUrl));
  }

  JwtPrincipalResolver(JwtDecoder supabaseJwtDecoder) {
    this.supabaseJwtDecoder = supabaseJwtDecoder;
  }

  public VerifiedJwtPrincipal resolve(String token) {
    Jwt jwt = supabaseJwtDecoder.decode(token);
    UUID userId = UUID.fromString(jwt.getSubject());
    String email = requireEmail(jwt.getClaimAsString("email"));
    return new VerifiedJwtPrincipal(userId, email, Provider.fromJwtProvider(resolveProvider(jwt)));
  }

  private static @Nullable String resolveProvider(Jwt jwt) {
    Map<String, Object> appMetadata = jwt.getClaimAsMap("app_metadata");
    if (appMetadata != null) {
      Object provider = appMetadata.get("provider");
      if (provider instanceof String providerText && !providerText.isBlank()) {
        return providerText;
      }
    }
    String topLevelProvider = jwt.getClaimAsString("provider");
    return topLevelProvider == null || topLevelProvider.isBlank() ? null : topLevelProvider;
  }

  private static JwtDecoder createSupabaseJwtDecoder(String supabaseUrl) {
    String normalizedSupabaseUrl = supabaseUrl.replaceAll("/+$", "");
    NimbusJwtDecoder decoder = NimbusJwtDecoder
        .withJwkSetUri(normalizedSupabaseUrl + "/auth/v1/.well-known/jwks.json")
        .jwsAlgorithm(SignatureAlgorithm.ES256)
        .build();

    OAuth2TokenValidator<Jwt> validator = new DelegatingOAuth2TokenValidator<>(
        JwtValidators.createDefaultWithIssuer(normalizedSupabaseUrl + "/auth/v1")
    );
    decoder.setJwtValidator(validator);
    return decoder;
  }

  private static String requireEmail(String email) {
    if (email == null || email.isBlank()) {
      throw new IllegalArgumentException("Token email claim is required");
    }
    return email;
  }
}
