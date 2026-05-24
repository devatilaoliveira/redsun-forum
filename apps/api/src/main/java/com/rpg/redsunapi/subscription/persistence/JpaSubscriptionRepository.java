package com.rpg.redsunapi.subscription.persistence;

import com.rpg.redsunapi.subscription.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface JpaSubscriptionRepository extends JpaRepository<Subscription, UUID> {

  Optional<Subscription> findByUserId(UUID userId);
}
