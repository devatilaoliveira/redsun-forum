package com.rpg.redsunapi.patchNote.persistence;

import com.rpg.redsunapi.patchNote.PatchNote;
import com.rpg.redsunapi.patchNote.PatchNoteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public class PatchNoteRepositoryAdapter implements PatchNoteRepository {

  private final JpaPatchNoteRepository jpaPatchNoteRepository;

  public PatchNoteRepositoryAdapter(JpaPatchNoteRepository jpaPatchNoteRepository) {
    this.jpaPatchNoteRepository = jpaPatchNoteRepository;
  }

  @Override
  public Page<PatchNote> findAll(Pageable pageable) {
    return jpaPatchNoteRepository.findAll(pageable);
  }
}
