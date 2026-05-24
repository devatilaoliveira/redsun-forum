package com.rpg.redsunapi.letter.persistence;

import com.rpg.redsunapi.letter.Letter;
import com.rpg.redsunapi.letter.LetterRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public class LetterRepositoryAdapter implements LetterRepository {

  private final JpaLetterRepository jpaLetterRepository;

  public LetterRepositoryAdapter(JpaLetterRepository jpaLetterRepository) {
    this.jpaLetterRepository = jpaLetterRepository;
  }

  @Override
  public Optional<Letter> findById(UUID id) {
    return jpaLetterRepository.findById(id);
  }

  @Override
  public Letter save(Letter letter) {
    return jpaLetterRepository.save(letter);
  }

  @Override
  public Page<Letter> findSentLettersForUser(UUID userId, Pageable pageable) {
    return jpaLetterRepository.findSentLettersForUser(userId, pageable);
  }

  @Override
  public Page<Letter> findReceivedLettersForUser(UUID userId, Pageable pageable) {
    return jpaLetterRepository.findReceivedLettersForUser(userId, pageable);
  }

  @Override
  public int deleteLettersOlderThan(OffsetDateTime cutoff) {
    return jpaLetterRepository.deleteLettersOlderThan(cutoff);
  }

  @Override
  public void deleteReadByForLettersOlderThan(OffsetDateTime cutoff) {
    jpaLetterRepository.deleteReadByForLettersOlderThan(cutoff);
  }

  @Override
  public void deleteRecipientsForLettersOlderThan(OffsetDateTime cutoff) {
    jpaLetterRepository.deleteRecipientsForLettersOlderThan(cutoff);
  }
}
