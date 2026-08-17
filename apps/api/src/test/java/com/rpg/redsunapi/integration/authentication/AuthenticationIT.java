package com.rpg.redsunapi.integration.authentication;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rpg.redsunapi.user.User;
import com.rpg.redsunapi.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("local")
class AuthenticationIT {
  private static final UUID SEEDED_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000101");
  private static final String SEEDED_EMAIL = "worker-login-1@redsun.com";
  private static final String SEEDED_PASSWORD = "123redsun1";
  private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

  @LocalServerPort
  private int serverPort;

  @Value("${supabase.url}")
  private String supabaseUrl;

  @Value("${supabase.secret-key}")
  private String supabaseSecretKey;

  private final ObjectMapper objectMapper;
  private final UserRepository userRepository;

  @Autowired
  AuthenticationIT(ObjectMapper objectMapper, UserRepository userRepository) {
    this.objectMapper = objectMapper;
    this.userRepository = userRepository;
  }

  @Test
  void shouldRejectSessionEstablishmentWithoutAuthentication() throws Exception {
    HttpResponse<String> response = HTTP_CLIENT.send(
      apiRequest(null),
      HttpResponse.BodyHandlers.ofString()
    );

    assertThat(response.statusCode()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
  }

  @Test
  void shouldEstablishSessionUsingRealSupabaseAccessToken() throws Exception {
    Instant requestStartedAt = Instant.now();
    String accessToken = signInWithSupabase();

    HttpResponse<String> response = HTTP_CLIENT.send(
      apiRequest(accessToken),
      HttpResponse.BodyHandlers.ofString()
    );

    assertThat(response.statusCode()).isEqualTo(HttpStatus.NO_CONTENT.value());

    User authenticatedUser = userRepository.findById(SEEDED_USER_ID).orElseThrow();
    assertThat(authenticatedUser.getEmail()).isEqualTo(SEEDED_EMAIL);
    assertThat(authenticatedUser.getLastSignInAt()).isNotNull();
    assertThat(authenticatedUser.getLastSignInAt().toInstant()).isAfterOrEqualTo(requestStartedAt);
  }

  private String signInWithSupabase() throws Exception {
    String requestBody = objectMapper.writeValueAsString(Map.of(
      "email", SEEDED_EMAIL,
      "password", SEEDED_PASSWORD
    ));

    HttpRequest request = HttpRequest.newBuilder()
      .uri(URI.create(supabaseUrl + "/auth/v1/token?grant_type=password"))
      .timeout(Duration.ofSeconds(10))
      .header("apikey", supabaseSecretKey)
      .header(HttpHeaders.CONTENT_TYPE, "application/json")
      .POST(HttpRequest.BodyPublishers.ofString(requestBody))
      .build();

    HttpResponse<String> response = HTTP_CLIENT.send(
      request,
      HttpResponse.BodyHandlers.ofString()
    );

    assertThat(response.statusCode())
      .as("Supabase sign-in response: %s", response.body())
      .isEqualTo(HttpStatus.OK.value());

    JsonNode accessToken = objectMapper.readTree(response.body()).path("access_token");
    assertThat(accessToken.asText()).isNotBlank();
    return accessToken.asText();
  }

  private HttpRequest apiRequest(String accessToken) {
    HttpRequest.Builder request = HttpRequest.newBuilder()
      .uri(URI.create("http://127.0.0.1:" + serverPort + "/authentication/session-established"))
      .timeout(Duration.ofSeconds(10))
      .POST(HttpRequest.BodyPublishers.noBody());

    if (accessToken != null) {
      request.header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
    }

    return request.build();
  }
}
