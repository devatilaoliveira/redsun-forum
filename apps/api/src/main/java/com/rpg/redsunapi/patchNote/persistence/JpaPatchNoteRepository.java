package com.rpg.redsunapi.patchNote.persistence;

import com.rpg.redsunapi.patchNote.PatchNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface JpaPatchNoteRepository extends JpaRepository<PatchNote, UUID> {
}
