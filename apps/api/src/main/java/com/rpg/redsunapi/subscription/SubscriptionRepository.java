package com.rpg.redsunapi.subscription;

import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository {

  Optional<Subscription> findByUserId(UUID userId);

  Subscription save(Subscription subscription);
}
