package com.rpg.redsunapi.tale.persistence;

import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JpaTaleRepository extends JpaRepository<Tale, UUID> {

  @Query(value = "SELECT DISTINCT t FROM Tale t LEFT JOIN t.participants p WHERE (t.ownerId = :userId OR p.id = :userId) AND (t.status IS NULL OR t.status <> com.rpg.redsunapi.tale.enums.ETaleStatus.SLEEP)", countQuery = "SELECT COUNT(DISTINCT t) FROM Tale t LEFT JOIN t.participants p WHERE (t.ownerId = :userId OR p.id = :userId) AND (t.status IS NULL OR t.status <> com.rpg.redsunapi.tale.enums.ETaleStatus.SLEEP)")
  Page<Tale> findAllByOwnerOrParticipant(UUID userId, Pageable pageable);

  @Query(value = "SELECT t FROM Tale t WHERE t.isPublic = TRUE AND (t.status IS NULL OR t.status <> com.rpg.redsunapi.tale.enums.ETaleStatus.SLEEP)", countQuery = "SELECT COUNT(t) FROM Tale t WHERE t.isPublic = TRUE AND (t.status IS NULL OR t.status <> com.rpg.redsunapi.tale.enums.ETaleStatus.SLEEP)")
  Page<Tale> findAllPublic(Pageable pageable);

  @Query(
    value = """
      SELECT t
      FROM Tale t
      WHERE t.isPublic = TRUE
        AND (t.status IS NULL OR t.status <> com.rpg.redsunapi.tale.enums.ETaleStatus.SLEEP)
        AND (:language IS NULL OR t.language = :language)
        AND (:rules IS NULL OR t.rules = :rules)
      """,
    countQuery = """
      SELECT COUNT(t)
      FROM Tale t
      WHERE t.isPublic = TRUE
        AND (t.status IS NULL OR t.status <> com.rpg.redsunapi.tale.enums.ETaleStatus.SLEEP)
        AND (:language IS NULL OR t.language = :language)
        AND (:rules IS NULL OR t.rules = :rules)
      """
  )
  Page<Tale> findAllPublic(Pageable pageable, ELanguage language, ERuleSystem rules);

  @Query("SELECT t FROM Tale t WHERE t.status = com.rpg.redsunapi.tale.enums.ETaleStatus.SLEEP AND t.lastTimeActive < :cutoff")
  List<Tale> findAllSleepTalesOlderThan(OffsetDateTime cutoff);

  @Query("SELECT t FROM Tale t WHERE t.id = :id AND (t.status IS NULL OR t.status <> com.rpg.redsunapi.tale.enums.ETaleStatus.SLEEP)")
  Optional<Tale> findById(UUID id);

  @Modifying(clearAutomatically = true)
  @Query("""
        delete from Tale t
        where t.status = com.rpg.redsunapi.tale.enums.ETaleStatus.SLEEP
          and t.lastTimeActive < :cutoff
      """)
  int deleteSleepTalesOlderThan(OffsetDateTime cutoff);
}
