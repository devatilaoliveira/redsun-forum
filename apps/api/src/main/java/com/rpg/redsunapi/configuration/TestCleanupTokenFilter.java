package com.rpg.redsunapi.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class TestCleanupTokenFilter extends OncePerRequestFilter {

  private static final String CLEANUP_TOKEN_HEADER = "X-Test-Cleanup-Token";

  private final String cleanupToken;

  public TestCleanupTokenFilter(@Value("${app.test.cleanup-token:}") String cleanupToken) {
    this.cleanupToken = cleanupToken;
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain
  ) throws ServletException, IOException {
    if (!isTestEndpoint(request)) {
      filterChain.doFilter(request, response);
      return;
    }

    String requestCleanupToken = request.getHeader(CLEANUP_TOKEN_HEADER);
    if (cleanupToken.isBlank() || !cleanupToken.equals(requestCleanupToken)) {
      response.sendError(HttpServletResponse.SC_FORBIDDEN, "Invalid cleanup token");
      return;
    }

    filterChain.doFilter(request, response);
  }

  private boolean isTestEndpoint(HttpServletRequest request) {
    String path = request.getServletPath();
    return path.equals("/test") || path.startsWith("/test/");
  }
}
