package com.rpg.redsunapi.location.persistence;

import com.rpg.redsunapi.location.Location;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface JpaLocationRepository extends JpaRepository<Location, UUID> {

  Page<Location> findByTaleId(UUID taleId, Pageable pageable);

  List<Location> findByTaleId(UUID taleId);
}
