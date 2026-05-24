package com.rpg.redsunapi.location.persistence;

import com.rpg.redsunapi.location.Location;
import com.rpg.redsunapi.location.LocationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class LocationRepositoryAdapter implements LocationRepository {

  private final JpaLocationRepository jpaLocationRepository;

  public LocationRepositoryAdapter(JpaLocationRepository jpaLocationRepository) {
    this.jpaLocationRepository = jpaLocationRepository;
  }

  @Override
  public Optional<Location> findById(UUID id) {
    return jpaLocationRepository.findById(id);
  }

  @Override
  public Page<Location> findByTaleId(UUID taleId, Pageable pageable) {
    return jpaLocationRepository.findByTaleId(taleId, pageable);
  }

  @Override
  public List<Location> findByTaleId(UUID taleId) {
    return jpaLocationRepository.findByTaleId(taleId);
  }

  @Override
  public Location save(Location location) {
    return jpaLocationRepository.save(location);
  }

  @Override
  public void delete(Location location) {
    jpaLocationRepository.delete(location);
  }
}
