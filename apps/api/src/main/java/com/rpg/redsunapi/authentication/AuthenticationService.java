package com.rpg.redsunapi.authentication;

import com.rpg.redsunapi.authentication.dto.AuthenticationResponse;
import com.rpg.redsunapi.email.EmailService;
import com.rpg.redsunapi.jwt.JwtTokenService;
import com.rpg.redsunapi.user.AuthProvider;
import com.rpg.redsunapi.user.User;
import com.rpg.redsunapi.user.UserRepository;
import com.rpg.redsunapi.utils.GeneralUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AuthenticationService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int RESET_CODE_LENGTH = 6;
    private static final int RESET_CODE_UPPER_BOUND = 1_000_000;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final EmailService emailService;
    private final PasswordResetRateLimiter passwordResetRateLimiter;
    private final int resetCodeExpiryMinutes;

    public AuthenticationService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService,
            EmailService emailService,
            PasswordResetRateLimiter passwordResetRateLimiter,
            @Value("${app.verification.code.expiry-minutes:15}") int resetCodeExpiryMinutes) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.emailService = emailService;
        this.passwordResetRateLimiter = passwordResetRateLimiter;
        this.resetCodeExpiryMinutes = resetCodeExpiryMinutes;
    }

    @Transactional
    public AuthenticationResponse login(String email, String password) {
        String normalizedEmail = GeneralUtil.normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (user.isDeleted() || user.getPasswordHash() == null
                || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (!user.isVerified()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        user.setLastSignInAt(OffsetDateTime.now());
        userRepository.save(user);

        String token = jwtTokenService.generateToken(user.getId(), user.getEmail(), user.getUsername());

        return new AuthenticationResponse(token, user.getId(), user.getEmail());
    }

    @Transactional
    public void sessionEstablished(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is deleted");
        }

        user.setLastSignInAt(OffsetDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void verifyEmailCode(String email, String code) {
        String normalizedEmail = GeneralUtil.normalizeEmail(email);
        String normalizedCode = code != null ? code.trim() : null;
        if (normalizedEmail == null || normalizedEmail.isBlank() || normalizedCode == null || normalizedCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification code");
        }

        User user = userRepository.findByEmail(normalizedEmail).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification code"));

        if (user.isDeleted()
                || user.getAuthProvider() != AuthProvider.EMAIL
                || user.isVerified()
                || user.getVerificationToken() == null
                || !user.getVerificationToken().equals(normalizedCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification code");
        }

        if (user.getVerificationTokenExpiry() != null
                && user.getVerificationTokenExpiry().isBefore(OffsetDateTime.now())) {
            user.setVerificationToken(null);
            user.setVerificationTokenExpiry(null);
            userRepository.save(user);
            throw new ResponseStatusException(HttpStatus.GONE, "Verification code expired");
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);

        userRepository.save(user);
    }

    @Transactional
    public void requestPasswordResetCode(String email) {
        String normalizedEmail = GeneralUtil.normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            return;
        }

        if (!passwordResetRateLimiter.isAllowed(normalizedEmail)) {
            return;
        }

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null
                || user.isDeleted()
                || user.getAuthProvider() != AuthProvider.EMAIL
                || !user.isVerified()
                || user.getPasswordHash() == null) {
            return;
        }

        String resetCode = newResetCode();
        user.setVerificationToken(resetCode);
        user.setVerificationTokenExpiry(OffsetDateTime.now().plusMinutes(resetCodeExpiryMinutes));
        userRepository.save(user);

        try {
            emailService.sendPasswordResetCodeEmail(normalizedEmail, resetCode);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to send password reset code", e);
        }
    }

    @Transactional
    public void resetPasswordWithCode(String email, String code, String newPassword) {
        String normalizedEmail = GeneralUtil.normalizeEmail(email);
        String normalizedCode = code != null ? code.trim() : null;

        if (normalizedEmail == null || normalizedEmail.isBlank()
                || normalizedCode == null || normalizedCode.isBlank()
                || newPassword == null || newPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid password reset code");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid password reset code"));

        if (user.isDeleted()
                || user.getAuthProvider() != AuthProvider.EMAIL
                || !user.isVerified()
                || user.getVerificationToken() == null
                || !user.getVerificationToken().equals(normalizedCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid password reset code");
        }

        if (user.getVerificationTokenExpiry() != null
                && user.getVerificationTokenExpiry().isBefore(OffsetDateTime.now())) {
            user.setVerificationToken(null);
            user.setVerificationTokenExpiry(null);
            userRepository.save(user);
            throw new ResponseStatusException(HttpStatus.GONE, "Password reset code expired");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
    }

    private String newResetCode() {
        int rawCode = SECURE_RANDOM.nextInt(RESET_CODE_UPPER_BOUND);
        return String.format("%0" + RESET_CODE_LENGTH + "d", rawCode);
    }
}
