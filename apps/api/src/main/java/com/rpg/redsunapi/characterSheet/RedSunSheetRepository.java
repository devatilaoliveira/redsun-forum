package com.rpg.redsunapi.characterSheet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@NullMarked
public interface RedSunSheetRepository extends JpaRepository<RedSunSheet, UUID> {

  Optional<RedSunSheet> findByTale_IdAndCharacterId(UUID taleId, UUID characterId);

  boolean existsByTale_IdAndCharacterId(UUID taleId, UUID characterId);

  List<RedSunSheet> findAllByTale_Id(UUID taleId);

  @Modifying
  @Query(
    value = """
      insert into public.redsun_sheets (id)
      select sheet.id
      from public.basic_sheets sheet
      where sheet.tale_id = :taleId and sheet.character_id = :characterId
      on conflict (id) do nothing
      """,
    nativeQuery = true
  )
  void ensureRedSunDetails(UUID taleId, UUID characterId);

  @Modifying
  @Query(
    value = """
      delete from public.redsun_sheets redsun
      using public.basic_sheets sheet
      where redsun.id = sheet.id
        and sheet.tale_id = :taleId
        and sheet.character_id = :characterId
      """,
    nativeQuery = true
  )
  void deleteRedSunDetails(UUID taleId, UUID characterId);
}
