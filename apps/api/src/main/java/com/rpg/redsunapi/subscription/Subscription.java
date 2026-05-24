package com.rpg.redsunapi.subscription;

import com.rpg.redsunapi.subscription.enums.ESubscriptionPlan;
import com.rpg.redsunapi.subscription.enums.ESubscriptionStatus;
import com.rpg.redsunapi.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
public class Subscription {

  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(updatable = false)
  private UUID id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(length = 10, nullable = false)
  private ESubscriptionPlan plan = ESubscriptionPlan.FREE;

  @Enumerated(EnumType.STRING)
  @Column(length = 20, nullable = false)
  private ESubscriptionStatus status = ESubscriptionStatus.ACTIVE;

  @Column(name = "current_period_start", columnDefinition = "TIMESTAMP WITH TIME ZONE")
  private OffsetDateTime currentPeriodStart;

  @Column(name = "current_period_end", columnDefinition = "TIMESTAMP WITH TIME ZONE")
  private OffsetDateTime currentPeriodEnd;

  @Column(name = "cancel_at_period_end", nullable = false)
  private boolean cancelAtPeriodEnd = false;

  public Subscription() {
  }

  public Subscription(User user) {
    this.user = user;
  }

  public Subscription(
    UUID id,
    User user,
    ESubscriptionPlan plan,
    ESubscriptionStatus status,
    OffsetDateTime currentPeriodStart,
    OffsetDateTime currentPeriodEnd,
    boolean cancelAtPeriodEnd
  ) {
    this.id = id;
    this.user = user;
    this.plan = plan != null ? plan : ESubscriptionPlan.FREE;
    this.status = status != null ? status : ESubscriptionStatus.ACTIVE;
    this.currentPeriodStart = currentPeriodStart;
    this.currentPeriodEnd = currentPeriodEnd;
    this.cancelAtPeriodEnd = cancelAtPeriodEnd;
  }

  @PrePersist
  public void prePersist() {
    if (plan == null) {
      plan = ESubscriptionPlan.FREE;
    }
    if (status == null) {
      status = ESubscriptionStatus.ACTIVE;
    }
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public ESubscriptionPlan getPlan() {
    return plan;
  }

  public void setPlan(ESubscriptionPlan plan) {
    this.plan = plan;
  }

  public ESubscriptionStatus getStatus() {
    return status;
  }

  public void setStatus(ESubscriptionStatus status) {
    this.status = status;
  }

  public OffsetDateTime getCurrentPeriodStart() {
    return currentPeriodStart;
  }

  public void setCurrentPeriodStart(OffsetDateTime currentPeriodStart) {
    this.currentPeriodStart = currentPeriodStart;
  }

  public OffsetDateTime getCurrentPeriodEnd() {
    return currentPeriodEnd;
  }

  public void setCurrentPeriodEnd(OffsetDateTime currentPeriodEnd) {
    this.currentPeriodEnd = currentPeriodEnd;
  }

  public boolean isCancelAtPeriodEnd() {
    return cancelAtPeriodEnd;
  }

  public void setCancelAtPeriodEnd(boolean cancelAtPeriodEnd) {
    this.cancelAtPeriodEnd = cancelAtPeriodEnd;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Subscription that = (Subscription) o;
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
