package com.rpg.redsunapi.post;

import com.rpg.redsunapi.post.enums.EPostStatus;
import com.rpg.redsunapi.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "posts")
public class Post {

  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(updatable = false)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author", nullable = false)
  private User author;

  @Column(name = "location", nullable = false)
  private UUID locationId;

  @Column(length = 1000)
  private String content;

  @Column(name = "creation_date", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
  private OffsetDateTime creationDate;

  @Enumerated(EnumType.STRING)
  @Column(length = 15)
  private EPostStatus status;

  public Post() {
  }

  public Post(
    UUID id,
    User author,
    String content,
    OffsetDateTime creationDate,
    UUID locationId,
    EPostStatus status
  ) {
    this.id = id;
    this.author = author;
    this.content = content;
    this.creationDate = creationDate;
    this.locationId = locationId;
    this.status = status;
  }

  @PrePersist
  public void prePersist() {
    if (creationDate == null) {
      creationDate = OffsetDateTime.now();
    }
    if (status == null) {
      status = EPostStatus.ACTIVE;
    }
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public User getAuthor() {
    return author;
  }

  public void setAuthor(User author) {
    this.author = author;
  }

  public UUID getLocationId() {
    return locationId;
  }

  public void setLocationId(UUID locationId) {
    this.locationId = locationId;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public OffsetDateTime getCreationDate() {
    return creationDate;
  }

  public void setCreationDate(OffsetDateTime creationDate) {
    this.creationDate = creationDate;
  }

  public EPostStatus getStatus() {
    return status;
  }

  public void setStatus(EPostStatus status) {
    this.status = status;
  }
}
