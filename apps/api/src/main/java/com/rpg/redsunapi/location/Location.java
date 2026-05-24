package com.rpg.redsunapi.location;

import com.rpg.redsunapi.location.enums.ELocationStatus;
import com.rpg.redsunapi.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "locations")
public class Location {

  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(updatable = false)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "author", nullable = false)
  private User author;

  @Column(name = "tale_id", nullable = false)
  private UUID taleId;

  @Column(name = "location_name", nullable = false, length = 120)
  private String locationName;

  @Column(length = 2000)
  private String description;

  @Column(name = "image_url", length = 500)
  private String imageURL;

  @Column(name = "last_time_active", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
  private OffsetDateTime lastTimeActive;

  @Enumerated(EnumType.STRING)
  @Column(length = 15, nullable = false)
  private ELocationStatus status;

  @Formula("(select count(*) from posts p where p.location = id)")
  private int postsCount;

  public Location() {
  }

  public Location(
    UUID id,
    User author,
    UUID taleId,
    String locationName,
    String description,
    String imageURL,
    OffsetDateTime lastTimeActive,
    ELocationStatus status
  ) {
    this.id = id;
    this.author = author;
    this.taleId = taleId;
    this.locationName = locationName;
    this.description = description;
    this.imageURL = imageURL;
    this.lastTimeActive = lastTimeActive;
    this.status = status;
  }

  @PrePersist
  public void prePersist() {
    if (lastTimeActive == null) {
      lastTimeActive = OffsetDateTime.now();
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

  public UUID getTaleId() {
    return taleId;
  }

  public void setTaleId(UUID taleId) {
    this.taleId = taleId;
  }

  public String getLocationName() {
    return locationName;
  }

  public void setLocationName(String locationName) {
    this.locationName = locationName;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getImageURL() {
    return imageURL;
  }

  public void setImageURL(String imageURL) {
    this.imageURL = imageURL;
  }

  public OffsetDateTime getLastTimeActive() {
    return lastTimeActive;
  }

  public void setLastTimeActive(OffsetDateTime lastTimeActive) {
    this.lastTimeActive = lastTimeActive;
  }

  public ELocationStatus getStatus() {
    return status;
  }

  public void setStatus(ELocationStatus status) {
    this.status = status;
  }

  public int getPostsCount() {
    return postsCount;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Location location = (Location) o;
    return Objects.equals(id, location.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}
