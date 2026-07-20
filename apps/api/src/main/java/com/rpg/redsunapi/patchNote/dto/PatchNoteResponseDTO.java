package com.rpg.redsunapi.patchNote.dto;

import com.rpg.redsunapi.patchNote.PatchNote;
import com.rpg.redsunapi.patchNote.PatchNoteContent;
import com.rpg.redsunapi.patchNote.PatchNoteItem;
import com.rpg.redsunapi.patchNote.PatchNoteLanguage;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PatchNoteResponseDTO(
  UUID id,
  LocalDate releaseDate,
  String title,
  String summary,
  List<PatchNoteItemDTO> items
) {

  public static PatchNoteResponseDTO from(PatchNote patchNote, PatchNoteLanguage language) {
    PatchNoteContent content = patchNote.contentFor(language);
    return new PatchNoteResponseDTO(
      patchNote.getId(),
      patchNote.getReleaseDate(),
      content.title(),
      content.summary(),
      content.items().stream().map(PatchNoteItemDTO::from).toList()
    );
  }

  public record PatchNoteItemDTO(String title, String description) {

    private static PatchNoteItemDTO from(PatchNoteItem item) {
      return new PatchNoteItemDTO(item.title(), item.description());
    }
  }
}
