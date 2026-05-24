package com.rpg.redsunapi.letter;

import com.rpg.redsunapi.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "letters")
public class Letter {

  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(updatable = false)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "sender", nullable = false)
  private User sender;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
    name = "letter_recipients",
    joinColumns = @JoinColumn(name = "letter_id"),
    inverseJoinColumns = @JoinColumn(name = "recipient_id")
  )
  private Set<User> recipients = new HashSet<>();

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
    name = "letter_read_by",
    joinColumns = @JoinColumn(name = "letter_id"),
    inverseJoinColumns = @JoinColumn(name = "user_id")
  )
  private Set<User> readBy = new HashSet<>();

  @Column(name = "sent_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
  private OffsetDateTime sentAt;

  @Column(length = 200)
  private String subject;

  @Column(length = 4000, nullable = false)
  private String content;

  public Letter() {
  }

  public Letter(
    UUID id,
    User sender,
    Set<User> recipients,
    Set<User> readBy,
    OffsetDateTime sentAt,
    String subject,
    String content
  ) {
    this.id = id;
    this.sender = sender;
    this.recipients = recipients != null ? recipients : new HashSet<>();
    this.readBy = readBy != null ? readBy : new HashSet<>();
    this.sentAt = sentAt;
    this.subject = subject;
    this.content = content;
  }

  @PrePersist
  public void prePersist() {
    if (sentAt == null) {
      sentAt = OffsetDateTime.now();
    }
    if (recipients == null) {
      recipients = new HashSet<>();
    }
    if (readBy == null) {
      readBy = new HashSet<>();
    }
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public User getSender() {
    return sender;
  }

  public void setSender(User sender) {
    this.sender = sender;
  }

  public Set<User> getRecipients() {
    return recipients;
  }

  public void setRecipients(Set<User> recipients) {
    this.recipients = recipients != null ? recipients : new HashSet<>();
  }

  public Set<User> getReadBy() {
    return readBy;
  }

  public void setReadBy(Set<User> readBy) {
    this.readBy = readBy != null ? readBy : new HashSet<>();
  }

  public OffsetDateTime getSentAt() {
    return sentAt;
  }

  public void setSentAt(OffsetDateTime sentAt) {
    this.sentAt = sentAt;
  }

  public String getSubject() {
    return subject;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Letter letter = (Letter) o;
    return Objects.equals(id, letter.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
