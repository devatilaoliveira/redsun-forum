package com.rpg.redsunapi.authentication;

import com.rpg.redsunapi.email.EmailService;
import com.rpg.redsunapi.legal.LegalDocumentService;
import com.rpg.redsunapi.subscription.Subscription;
import com.rpg.redsunapi.subscription.SubscriptionRepository;
import com.rpg.redsunapi.user.AuthProvider;
import com.rpg.redsunapi.user.User;
import com.rpg.redsunapi.user.UserRepository;
import com.rpg.redsunapi.utils.GeneralUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class RegistrationService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int VERIFICATION_CODE_LENGTH = 6;
    private static final int VERIFICATION_CODE_UPPER_BOUND = 1_000_000;

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ResendVerificationRateLimiter rateLimiter;
    private final LegalDocumentService legalDocumentService;
    private final int verificationCodeExpiryMinutes;

    public RegistrationService(
            UserRepository userRepository,
            SubscriptionRepository subscriptionRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            ResendVerificationRateLimiter rateLimiter,
            LegalDocumentService legalDocumentService,
            @Value("${app.verification.code.expiry-minutes:15}") int verificationCodeExpiryMinutes) {
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.rateLimiter = rateLimiter;
        this.legalDocumentService = legalDocumentService;
        this.verificationCodeExpiryMinutes = verificationCodeExpiryMinutes;
    }

    @Transactional
    public void registerUser(
            String email,
            String password,
            Boolean acceptedTerms,
            Boolean acknowledgedPrivacy) {
        ensureLegalAcknowledgement(acceptedTerms, acknowledgedPrivacy);

        String normalizedEmail = GeneralUtil.normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            return;
        }

        User existingUser = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (existingUser != null) {
            if (existingUser.getAuthProvider() != AuthProvider.EMAIL || existingUser.isVerified()) {
                return;
            }

            refreshEmailUserVerification(existingUser, password);
            return;
        }

        String passwordHash = passwordEncoder.encode(password);
        VerificationCode verification = newVerificationCode();

        String username = userRepository.nextUsername(AuthenticationConstants.USERNAME_PREFIX);

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(normalizedEmail);
        user.setUsername(username);
        user.setPasswordHash(passwordHash);
        user.setVerified(false);
        user.setVerificationToken(verification.code());
        user.setVerificationTokenExpiry(verification.expiry());
        user.setAuthProvider(AuthProvider.EMAIL);
        applyCurrentLegalAcknowledgement(user);

        try {
            User savedUser = userRepository.save(user);
            subscriptionRepository.save(new Subscription(savedUser));
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered", ex);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create user", ex);
        }

        try {
            emailService.sendVerificationEmail(normalizedEmail, verification.code());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to send verification email", e);
        }
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        String normalizedEmail = GeneralUtil.normalizeEmail(email);
        if (normalizedEmail == null || normalizedEmail.isBlank()) {
            return;
        }

        if (!rateLimiter.isAllowed(normalizedEmail)) {
            return;
        }

        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null || user.isDeleted() || user.isVerified() || user.getAuthProvider() != AuthProvider.EMAIL) {
            return;
        }

        VerificationCode verification = newVerificationCode();
        user.setVerificationToken(verification.code());
        user.setVerificationTokenExpiry(verification.expiry());
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(normalizedEmail, verification.code());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to resend verification email", e);
        }
    }

    @Transactional(readOnly = true)
    public String getVerificationCodeByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Verification code not found"));

        if (user.isDeleted()
                || user.isVerified()
                || user.getAuthProvider() != AuthProvider.EMAIL
                || user.getVerificationToken() == null
                || user.getVerificationToken().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Verification code not found");
        }

        return user.getVerificationToken();
    }

    private void refreshEmailUserVerification(User user, String password) {
        VerificationCode verification = newVerificationCode();
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setVerified(false);
        user.setVerificationToken(verification.code());
        user.setVerificationTokenExpiry(verification.expiry());
        applyCurrentLegalAcknowledgement(user);
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(user.getEmail(), verification.code());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to send verification email", e);
        }
    }

    private VerificationCode newVerificationCode() {
        int rawCode = SECURE_RANDOM.nextInt(VERIFICATION_CODE_UPPER_BOUND);
        String code = String.format("%0" + VERIFICATION_CODE_LENGTH + "d", rawCode);

        return new VerificationCode(
            code,
            OffsetDateTime.now().plusMinutes(verificationCodeExpiryMinutes)
        );
    }

    private void ensureLegalAcknowledgement(Boolean acceptedTerms, Boolean acknowledgedPrivacy) {
        if (!Boolean.TRUE.equals(acceptedTerms) || !Boolean.TRUE.equals(acknowledgedPrivacy)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Terms and privacy acknowledgement are required");
        }
    }

    private void applyCurrentLegalAcknowledgement(User user) {
        OffsetDateTime now = OffsetDateTime.now();
        user.setTermsAcceptedAt(now);
        user.setTermsVersion(legalDocumentService.currentTermsVersion());
        user.setPrivacyAcknowledgedAt(now);
        user.setPrivacyVersion(legalDocumentService.currentPrivacyVersion());
    }

    private record VerificationCode(String code, OffsetDateTime expiry) { }
}
