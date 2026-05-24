package com.rpg.redsunapi.letter.persistence;

import com.rpg.redsunapi.letter.Letter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.UUID;

public interface JpaLetterRepository extends JpaRepository<Letter, UUID> {

  @Query("""
    select l from Letter l
    where l.sender.id = :userId
  """)
  Page<Letter> findSentLettersForUser(UUID userId, Pageable pageable);

  @Query("""
    select distinct l from Letter l
    join l.recipients r
    where r.id = :userId
  """)
  Page<Letter> findReceivedLettersForUser(UUID userId, Pageable pageable);

  @Modifying(clearAutomatically = true)
  @Query("""
    delete from Letter l
    where l.sentAt < :cutoff
  """)
  int deleteLettersOlderThan(OffsetDateTime cutoff);

  @Modifying(clearAutomatically = true)
  @Query(value = """
    delete from letter_read_by
    where letter_id in (select id from letters where sent_at < :cutoff)
  """, nativeQuery = true)
  void deleteReadByForLettersOlderThan(OffsetDateTime cutoff);

  @Modifying(clearAutomatically = true)
  @Query(value = """
    delete from letter_recipients
    where letter_id in (select id from letters where sent_at < :cutoff)
  """, nativeQuery = true)
  void deleteRecipientsForLettersOlderThan(OffsetDateTime cutoff);
}
