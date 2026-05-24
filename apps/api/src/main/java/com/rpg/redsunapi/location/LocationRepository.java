package com.rpg.redsunapi.location;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LocationRepository {

  Optional<Location> findById(UUID id);

  Page<Location> findByTaleId(UUID taleId, Pageable pageable);

  List<Location> findByTaleId(UUID taleId);

  Location save(Location location);

  void delete(Location location);
}
