package com.rpg.redsunapi.authentication;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PasswordResetRateLimiter {

    private final Map<String, Instant> lastRequestTime = new ConcurrentHashMap<>();
    private static final Duration COOLDOWN_PERIOD = Duration.ofMinutes(2);

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

    private void cleanupOldEntries(Instant now) {
        lastRequestTime.entrySet().removeIf(
                entry -> Duration.between(entry.getValue(), now).compareTo(COOLDOWN_PERIOD.multipliedBy(2)) > 0);
    }
}
