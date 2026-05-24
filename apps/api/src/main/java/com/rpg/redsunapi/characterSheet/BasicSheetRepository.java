package com.rpg.redsunapi.characterSheet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface BasicSheetRepository extends JpaRepository<BasicSheet, UUID> {

  Optional<BasicSheet> findByTale_IdAndCharacterId(UUID taleId, UUID characterId);

  boolean existsByTale_IdAndCharacterId(UUID taleId, UUID characterId);

  @Modifying
  @Query("delete from BasicSheet sheet where sheet.tale.id = :taleId")
  void deleteByTaleId(UUID taleId);

  @Modifying
  @Query("delete from BasicSheet sheet where sheet.tale.id = :taleId and sheet.characterId = :characterId")
  void deleteByTaleIdAndCharacterId(UUID taleId, UUID characterId);
}
