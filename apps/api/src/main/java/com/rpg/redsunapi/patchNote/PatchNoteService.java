package com.rpg.redsunapi.patchNote;

import com.rpg.redsunapi.patchNote.dto.PatchNoteResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatchNoteService {

  private static final int PAGE_SIZE = 1;
  private static final Sort NEWEST_FIRST = Sort.by(
    Sort.Order.desc("releaseDate"),
    Sort.Order.desc("id")
  );

  private final PatchNoteRepository patchNoteRepository;

  public PatchNoteService(PatchNoteRepository patchNoteRepository) {
    this.patchNoteRepository = patchNoteRepository;
  }

  @Transactional(readOnly = true)
  public Page<PatchNoteResponseDTO> findPatchNotes(int page, PatchNoteLanguage language) {
    PageRequest pageRequest = PageRequest.of(page, PAGE_SIZE, NEWEST_FIRST);
    return patchNoteRepository.findAll(pageRequest)
      .map(patchNote -> PatchNoteResponseDTO.from(patchNote, language));
  }
}
