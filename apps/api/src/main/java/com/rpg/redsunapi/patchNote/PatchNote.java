package com.rpg.redsunapi.patchNote;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

import java.time.LocalDate;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "patch_notes")
@NullMarked
public class PatchNote {

  @Id
  @GeneratedValue
  @UuidGenerator
  @Column(updatable = false)
  private @Nullable UUID id;

  @Column(name = "release_date", nullable = false)
  private LocalDate releaseDate;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "content_pt", nullable = false, columnDefinition = "jsonb")
  private PatchNoteContent contentPt;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "content_en", nullable = false, columnDefinition = "jsonb")
  private PatchNoteContent contentEn;

  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "content_de", nullable = false, columnDefinition = "jsonb")
  private PatchNoteContent contentDe;

  @SuppressWarnings("NullAway.Init")
  protected PatchNote() {
  }

  public PatchNote(
    UUID id,
    LocalDate releaseDate,
    PatchNoteContent contentPt,
    PatchNoteContent contentEn,
    PatchNoteContent contentDe
  ) {
    this.id = id;
    this.releaseDate = releaseDate;
    this.contentPt = contentPt;
    this.contentEn = contentEn;
    this.contentDe = contentDe;
  }

  public UUID getId() {
    return Objects.requireNonNull(id, "Patch note id is only available after persistence");
  }

  public LocalDate getReleaseDate() {
    return releaseDate;
  }

  public PatchNoteContent contentFor(PatchNoteLanguage language) {
    return switch (language) {
      case PT -> contentPt;
      case EN -> contentEn;
      case DE -> contentDe;
    };
  }
}
