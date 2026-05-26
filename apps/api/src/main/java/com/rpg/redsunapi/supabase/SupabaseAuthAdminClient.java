package com.rpg.redsunapi.supabase;

import com.rpg.redsunapi.supabase.exception.SupabaseAuthException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.UUID;

public class SupabaseAuthAdminClient {

  private final RestClient client;

  public SupabaseAuthAdminClient(String baseUrl, String secretKey) {
    this.client = RestClient.builder()
      .baseUrl(baseUrl + "/auth/v1")
      .defaultHeader("apikey", secretKey)
      .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + secretKey)
      .build();
  }

  public void deleteUser(UUID userId) {
    if (userId == null) {
      return;
    }

    try {
      client.delete()
        .uri("/admin/users/{userId}", userId)
        .retrieve()
        .toBodilessEntity();
    } catch (RestClientResponseException ex) {
      if (ex.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
        return;
      }
      throw new SupabaseAuthException("Authentication service rejected the delete user request", ex);
    } catch (ResourceAccessException ex) {
      throw new SupabaseAuthException("Unable to reach authentication service to delete user", ex);
    }
  }
}
