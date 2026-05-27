package com.rpg.redsunapi.tale;

import com.rpg.redsunapi.characterSheet.BasicSheet;
import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import com.rpg.redsunapi.tale.enums.ETaleStatus;
import com.rpg.redsunapi.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "tales")
public class Tale {

  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(updatable = false)
  private UUID id;

  @Column(name = "tale_name", nullable = false, length = 120)
  private String taleName;

  @Column(name = "owner_id", nullable = false)
  private UUID ownerId;

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
    name = "tale_participants",
    joinColumns = @JoinColumn(name = "tale_id"),
    inverseJoinColumns = @JoinColumn(name = "participant_id")
  )
  private Set<User> participants = new HashSet<>();

  @Column(name = "is_public", nullable = false)
  private Boolean isPublic = Boolean.FALSE;

  @Column(name = "image_url", length = 500)
  private String imageURL;

  @Column(length = 4000)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(name = "language", length = 10)
  private ELanguage language;

  @Enumerated(EnumType.STRING)
  @Column(length = 15, nullable = false)
  private ERuleSystem rules;

  @Column(name = "creation_date", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
  private OffsetDateTime creationDate;

  @Column(name = "last_time_active", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
  private OffsetDateTime lastTimeActive;

  @Enumerated(EnumType.STRING)
  @Column(length = 15)
  private ETaleStatus status;

  @Formula("(select count(*) from tale_participants tp where tp.tale_id = id)")
  private int participantsCount;

  @OneToMany(mappedBy = "tale", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<BasicSheet> basicSheets = new HashSet<>();

  public Tale() {
  }

  public Tale(
    UUID id,
    String taleName,
    UUID ownerId,
    Set<User> participants,
    Boolean isPublic,
    String imageURL,
    String description,
    ELanguage language,
    ERuleSystem rules,
    OffsetDateTime creationDate,
    OffsetDateTime lastTimeActive,
    ETaleStatus status,
    Set<BasicSheet> basicSheets
  ) {
    this.id = id;
    this.taleName = taleName;
    this.ownerId = ownerId;
    this.participants = participants != null ? participants : new HashSet<>();
    this.isPublic = isPublic != null ? isPublic : Boolean.FALSE;
    this.imageURL = imageURL;
    this.description = description;
    this.language = language;
    this.rules = rules;
    this.creationDate = creationDate;
    this.lastTimeActive = lastTimeActive;
    this.status = status;
    setBasicSheets(basicSheets);
  }

  @PrePersist
  public void prePersist() {
    OffsetDateTime now = OffsetDateTime.now();
    if (creationDate == null) {
      creationDate = now;
    }
    if (lastTimeActive == null) {
      lastTimeActive = creationDate;
    }
    if (isPublic == null) {
      isPublic = Boolean.FALSE;
    }
    if (participants == null) {
      participants = new HashSet<>();
    }
    if (basicSheets == null) {
      basicSheets = new HashSet<>();
    }
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getTaleName() {
    return taleName;
  }

  public void setTaleName(String taleName) {
    this.taleName = taleName;
  }

  public UUID getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(UUID ownerId) {
    this.ownerId = ownerId;
  }

  public Set<User> getParticipants() {
    return participants;
  }

  public void setParticipants(Set<User> participants) {
    this.participants = participants != null ? participants : new HashSet<>();
  }

  public Boolean getPublic() {
    return isPublic;
  }

  public void setPublic(Boolean aPublic) {
    isPublic = aPublic != null ? aPublic : Boolean.FALSE;
  }

  public String getImageURL() {
    return imageURL;
  }

  public void setImageURL(String imageURL) {
    this.imageURL = imageURL;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public ELanguage getLanguage() {
    return language;
  }

  public void setLanguage(ELanguage language) {
    this.language = language;
  }

  public ERuleSystem getRules() {
    return rules;
  }

  public void setRules(ERuleSystem rules) {
    this.rules = rules;
  }

  public OffsetDateTime getCreationDate() {
    return creationDate;
  }

  public void setCreationDate(OffsetDateTime creationDate) {
    this.creationDate = creationDate;
  }

  public OffsetDateTime getLastTimeActive() {
    return lastTimeActive;
  }

  public void setLastTimeActive(OffsetDateTime lastTimeActive) {
    this.lastTimeActive = lastTimeActive;
  }

  public ETaleStatus getStatus() {
    return status;
  }

  public void setStatus(ETaleStatus status) {
    this.status = status;
  }

  public int getParticipantsCount() {
    return participantsCount;
  }

  public Set<BasicSheet> getBasicSheets() {
    return basicSheets;
  }

  public void setBasicSheets(Set<BasicSheet> basicSheets) {
    this.basicSheets = basicSheets != null ? basicSheets : new HashSet<>();
    this.basicSheets.forEach(sheet -> sheet.setTale(this));
  }

  public void addBasicSheet(BasicSheet sheet) {
    if (sheet == null) {
      return;
    }
    if (basicSheets == null) {
      basicSheets = new HashSet<>();
    }
    sheet.setTale(this);
    basicSheets.add(sheet);
  }

  public void removeBasicSheet(UUID characterId) {
    if (basicSheets == null || characterId == null) {
      return;
    }

    basicSheets.removeIf(sheet -> characterId.equals(sheet.getCharacterId()));
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Tale tale = (Tale) o;
    return Objects.equals(id, tale.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  @Override
  public String toString() {
    return "Tale{" +
      "id='" + id + '\'' +
      ", taleName='" + taleName + '\'' +
      ", language='" + language + '\'' +
      ", ownerId='" + ownerId +
      "'}";
  }
}
