package com.rpg.redsunapi.authentication;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory rate limiter for resend verification emails.
 * In production, consider using Redis or a dedicated rate limiting library.
 */
@Component
public class ResendVerificationRateLimiter {

    private final Map<String, Instant> lastRequestTime = new ConcurrentHashMap<>();
    private static final Duration COOLDOWN_PERIOD = Duration.ofMinutes(2);

    /**
     * Checks if a request is allowed for the given email.
     * 
     * @param email the email address
     * @return true if allowed, false if rate limited
     */
    public boolean isAllowed(String email) {
        Instant now = Instant.now();
        Instant lastRequest = lastRequestTime.get(email);

        if (lastRequest == null || Duration.between(lastRequest, now).compareTo(COOLDOWN_PERIOD) >= 0) {
            lastRequestTime.put(email, now);
            cleanupOldEntries(now);
            return true;
        }

        return false;
    }

    /**
     * Gets the remaining cooldown time for an email.
     * 
     * @param email the email address
     * @return remaining cooldown duration, or Duration.ZERO if no cooldown
     */
    public Duration getRemainingCooldown(String email) {
        Instant lastRequest = lastRequestTime.get(email);
        if (lastRequest == null) {
            return Duration.ZERO;
        }

        Duration elapsed = Duration.between(lastRequest, Instant.now());
        Duration remaining = COOLDOWN_PERIOD.minus(elapsed);
        return remaining.isNegative() ? Duration.ZERO : remaining;
    }

    private void cleanupOldEntries(Instant now) {
        lastRequestTime.entrySet().removeIf(
                entry -> Duration.between(entry.getValue(), now).compareTo(COOLDOWN_PERIOD.multipliedBy(2)) > 0);
    }
}
