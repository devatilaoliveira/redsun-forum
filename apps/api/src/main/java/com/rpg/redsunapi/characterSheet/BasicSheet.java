package com.rpg.redsunapi.characterSheet;

import com.rpg.redsunapi.tale.Tale;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.hibernate.annotations.UuidGenerator;

import java.util.Objects;
import java.util.UUID;

@Entity
@Table(
  name = "basic_sheets",
  uniqueConstraints = @UniqueConstraint(name = "uk_basic_sheets_tale_character", columnNames = {"tale_id", "character_id"})
)
@Inheritance(strategy = InheritanceType.JOINED)
public class BasicSheet implements CharacterSheet {

  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(updatable = false)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "tale_id", nullable = false)
  private Tale tale;

  @Column(name = "character_id", nullable = false)
  private UUID characterId;

  @Column(name = "character_name", length = 120)
  private String characterName;

  @Column(name = "character_description", length = 4000)
  private String characterDescription;

  @Column(name = "character_image_url", length = 500)
  private String characterImageUrl;

  public BasicSheet() {
  }

  public BasicSheet(Tale tale, UUID characterId) {
    this.tale = tale;
    this.characterId = characterId;
  }

  @Override
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public Tale getTale() {
    return tale;
  }

  public void setTale(Tale tale) {
    this.tale = tale;
  }

  @Override
  public UUID getCharacterId() {
    return characterId;
  }

  public void setCharacterId(UUID characterId) {
    this.characterId = characterId;
  }

  public String getCharacterName() {
    return characterName;
  }

  @Override
  public void setCharacterName(String characterName) {
    this.characterName = characterName;
  }

  public String getCharacterDescription() {
    return characterDescription;
  }

  public void setCharacterDescription(String characterDescription) {
    this.characterDescription = characterDescription;
  }

  @Override
  public String getCharacterImageUrl() {
    return characterImageUrl;
  }

  @Override
  public void setCharacterImageUrl(String characterImageUrl) {
    this.characterImageUrl = characterImageUrl;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    BasicSheet that = (BasicSheet) o;
    return id != null && Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }
}
