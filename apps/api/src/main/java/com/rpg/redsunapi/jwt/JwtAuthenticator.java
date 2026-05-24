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

  public JwtAuthenticator(UserService userService) {
    this.userService = userService;
  }

  public UsernamePasswordAuthenticationToken authenticate(String token, HttpServletRequest request) {
    User user = userService.upsertUser(token);
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
