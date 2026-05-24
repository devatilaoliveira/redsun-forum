package com.rpg.redsunapi.authentication;

import com.rpg.redsunapi.authentication.dto.AuthenticationResponse;
import com.rpg.redsunapi.authentication.dto.LoginRequest;
import com.rpg.redsunapi.authentication.dto.RequestPasswordResetCodeRequest;
import com.rpg.redsunapi.authentication.dto.RegistrationRequest;
import com.rpg.redsunapi.authentication.dto.ResendVerificationRequest;
import com.rpg.redsunapi.authentication.dto.ResetPasswordWithCodeRequest;
import com.rpg.redsunapi.authentication.dto.VerifyEmailCodeRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/authentication")
public class AuthenticationController {
    private final RegistrationService registrationService;
    private final AuthenticationService authenticationService;

    public AuthenticationController(
            RegistrationService registrationService,
            AuthenticationService authenticationService) {
        this.registrationService = registrationService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegistrationRequest request) {
        registrationService.registerUser(
                request.email(),
                request.password(),
                request.acceptedTerms(),
                request.acknowledgedPrivacy()
        );
        return ResponseEntity.ok("If the email is eligible, a verification code will be sent.");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthenticationResponse response = authenticationService.login(request.email(), request.password());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/session-established")
    public ResponseEntity<Void> sessionEstablished(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        authenticationService.sessionEstablished(principal.user().getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email-code")
    public ResponseEntity<String> verifyEmailCode(@Valid @RequestBody VerifyEmailCodeRequest request) {
        authenticationService.verifyEmailCode(request.email(), request.code());
        return ResponseEntity.ok("Email verified.");
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        registrationService.resendVerificationEmail(request.email());
        return ResponseEntity.ok("If the email is eligible, a verification code will be sent.");
    }

    @PostMapping("/forgot-password/request-code")
    public ResponseEntity<String> requestPasswordResetCode(@Valid @RequestBody RequestPasswordResetCodeRequest request) {
        authenticationService.requestPasswordResetCode(request.email());
        return ResponseEntity.ok("If the email is eligible, a password reset code will be sent.");
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<String> resetPasswordWithCode(@Valid @RequestBody ResetPasswordWithCodeRequest request) {
        authenticationService.resetPasswordWithCode(request.email(), request.code(), request.newPassword());
        return ResponseEntity.ok("Password reset successfully.");
    }
}
