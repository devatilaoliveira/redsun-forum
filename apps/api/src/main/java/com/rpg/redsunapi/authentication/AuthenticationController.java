package com.rpg.redsunapi.authentication;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/authentication")
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/session-established")
    public ResponseEntity<Void> sessionEstablished(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        authenticationService.recordSessionEstablished(principal.user().getId());
        return ResponseEntity.noContent().build();
    }
}
