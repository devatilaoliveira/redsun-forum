package com.rpg.redsunapi.characterSheet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.jspecify.annotations.NullMarked;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@NullMarked
public interface RedSunSheetRepository extends JpaRepository<RedSunSheet, UUID> {

  Optional<RedSunSheet> findByTale_IdAndCharacterId(UUID taleId, UUID characterId);

  boolean existsByTale_IdAndCharacterId(UUID taleId, UUID characterId);

  List<RedSunSheet> findAllByTale_Id(UUID taleId);
}
