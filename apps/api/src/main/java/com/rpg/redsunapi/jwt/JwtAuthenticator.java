package com.rpg.redsunapi.jwt;

import com.rpg.redsunapi.authentication.AuthenticatedUser;
import com.rpg.redsunapi.user.User;
import com.rpg.redsunapi.user.UserService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@Component
public class JwtAuthenticator {

  private final UserService userService;
  private final JwtPrincipalResolver jwtPrincipalResolver;

  public JwtAuthenticator(UserService userService, JwtPrincipalResolver jwtPrincipalResolver) {
    this.userService = userService;
    this.jwtPrincipalResolver = jwtPrincipalResolver;
  }

  public UsernamePasswordAuthenticationToken authenticate(String token, HttpServletRequest request) {
    VerifiedJwtPrincipal verifiedPrincipal = jwtPrincipalResolver.resolve(token);
    User user = userService.upsertUser(
      verifiedPrincipal.userId(),
      verifiedPrincipal.email()
    );
    AuthenticatedUser principal = new AuthenticatedUser(user);

    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
      principal,
      token,
      List.of()
    );
    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    return authentication;
  }
}
