package com.rpg.redsunapi.tale.persistence;

import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.TaleRepository;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class TaleRepositoryAdapter implements TaleRepository {

  private final JpaTaleRepository jpaTaleRepository;

  public TaleRepositoryAdapter(JpaTaleRepository jpaTaleRepository) {
    this.jpaTaleRepository = jpaTaleRepository;
  }

  @Override
  public Optional<Tale> findById(UUID id) {
    return jpaTaleRepository.findById(id);
  }

  @Override
  public Tale save(Tale tale) {
    return jpaTaleRepository.save(tale);
  }

  @Override
  public Page<Tale> findAllByOwnerOrParticipant(UUID userId, Pageable pageable) {
    return jpaTaleRepository.findAllByOwnerOrParticipant(userId, pageable);
  }

  @Override
  public Page<Tale> findAllPublic(Pageable pageable) {
    return jpaTaleRepository.findAllPublic(pageable);
  }

  @Override
  public Page<Tale> findAllPublic(Pageable pageable, String language, ERuleSystem rules) {
    return jpaTaleRepository.findAllPublic(pageable, language, rules);
  }

  @Override
  public List<Tale> findAllSleepTalesOlderThan(OffsetDateTime cutoff) {
    return jpaTaleRepository.findAllSleepTalesOlderThan(cutoff);
  }

  @Override
  public int deleteSleepTalesOlderThan(OffsetDateTime cutoff) {
    return jpaTaleRepository.deleteSleepTalesOlderThan(cutoff);
  }
}
