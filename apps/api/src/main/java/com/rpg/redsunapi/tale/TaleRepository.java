package com.rpg.redsunapi.tale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.rpg.redsunapi.tale.enums.ERuleSystem;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaleRepository {

  Optional<Tale> findById(UUID id);

  Tale save(Tale tale);

  Page<Tale> findAllByOwnerOrParticipant(UUID userId, Pageable pageable);

  Page<Tale> findAllPublic(Pageable pageable);

  Page<Tale> findAllPublic(Pageable pageable, String language, ERuleSystem rules);

  List<Tale> findAllSleepTalesOlderThan(OffsetDateTime cutoff);

  int deleteSleepTalesOlderThan(OffsetDateTime cutoff);
}
