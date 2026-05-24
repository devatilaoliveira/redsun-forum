package com.rpg.redsunapi.subscription.dto;

import com.rpg.redsunapi.subscription.Subscription;
import com.rpg.redsunapi.subscription.enums.ESubscriptionPlan;

import java.util.Objects;

public record SubscriptionDTO(
  String id,
  ESubscriptionPlan plan
) {

  public static SubscriptionDTO from(Subscription subscription) {
    Objects.requireNonNull(subscription, "subscription");

    return new SubscriptionDTO(
      subscription.getId() != null ? subscription.getId().toString() : null,
      subscription.getPlan()
    );
  }
}
