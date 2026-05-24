package com.rpg.redsunapi.subscription.persistence;

import com.rpg.redsunapi.subscription.Subscription;
import com.rpg.redsunapi.subscription.SubscriptionRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class SubscriptionRepositoryAdapter implements SubscriptionRepository {

  private final JpaSubscriptionRepository jpaSubscriptionRepository;

  public SubscriptionRepositoryAdapter(JpaSubscriptionRepository jpaSubscriptionRepository) {
    this.jpaSubscriptionRepository = jpaSubscriptionRepository;
  }

  @Override
  public Optional<Subscription> findByUserId(UUID userId) {
    return jpaSubscriptionRepository.findByUserId(userId);
  }

  @Override
  public Subscription save(Subscription subscription) {
    return jpaSubscriptionRepository.save(subscription);
  }
}
