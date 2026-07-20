package com.rpg.redsunapi.patchNote;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PatchNoteRepository {

  Page<PatchNote> findAll(Pageable pageable);
}
