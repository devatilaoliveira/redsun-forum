package com.rpg.redsunapi.letter;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

public interface LetterRepository {

  Optional<Letter> findById(UUID id);

  Letter save(Letter letter);

  Page<Letter> findSentLettersForUser(UUID userId, Pageable pageable);

  Page<Letter> findReceivedLettersForUser(UUID userId, Pageable pageable);

  int deleteLettersOlderThan(OffsetDateTime cutoff);

  void deleteReadByForLettersOlderThan(OffsetDateTime cutoff);

  void deleteRecipientsForLettersOlderThan(OffsetDateTime cutoff);
}
