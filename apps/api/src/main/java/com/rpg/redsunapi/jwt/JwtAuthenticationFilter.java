package com.rpg.redsunapi.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final BearerTokenResolver bearerTokenResolver;
  private final JwtAuthenticator jwtAuthenticator;

  public JwtAuthenticationFilter(BearerTokenResolver bearerTokenResolver, JwtAuthenticator jwtAuthenticator) {
    this.bearerTokenResolver = bearerTokenResolver;
    this.jwtAuthenticator = jwtAuthenticator;
  }

  @Override
  protected void doFilterInternal(
    @NonNull HttpServletRequest request,
    @NonNull HttpServletResponse response,
    @NonNull FilterChain filterChain
  ) throws ServletException, IOException {
    if (SecurityContextHolder.getContext().getAuthentication() != null) {
      filterChain.doFilter(request, response);
      return;
    }

    String token;
    try {
      token = bearerTokenResolver.resolve(request).orElse(null);
    } catch (IllegalArgumentException e) {
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
      return;
    }

    if (token == null) {
      filterChain.doFilter(request, response);
      return;
    }

    try {
      UsernamePasswordAuthenticationToken authentication = jwtAuthenticator.authenticate(token, request);
      SecurityContextHolder.getContext().setAuthentication(authentication);
    } catch (ResponseStatusException e) {
      int status = e.getStatusCode().value();
      String reason = e.getReason() != null ? e.getReason() : "Unauthorized";
      response.sendError(status, reason);
      return;
    } catch (JwtException | IllegalArgumentException e) {
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
      return;
    }

    filterChain.doFilter(request, response);
  }
}
