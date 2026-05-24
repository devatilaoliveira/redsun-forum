package com.rpg.redsunapi.location;

import com.rpg.redsunapi.location.dto.LocationDetailDTO;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.TaleAccessPolicy;
import com.rpg.redsunapi.tale.TaleRepository;
import com.rpg.redsunapi.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class LocationReadService {

  private final LocationRepository locationRepository;
  private final TaleRepository taleRepository;
  private final TaleAccessPolicy taleAccessPolicy;

  public LocationReadService(
    LocationRepository locationRepository,
    TaleRepository taleRepository,
    TaleAccessPolicy taleAccessPolicy
  ) {
    this.locationRepository = locationRepository;
    this.taleRepository = taleRepository;
    this.taleAccessPolicy = taleAccessPolicy;
  }

  @Transactional(readOnly = true)
  public LocationDetailDTO findLocationDetailById(UUID locationId, User requester) {
    Location location = locationRepository.findById(locationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));

    Tale tale = loadTaleForLocation(location);
    taleAccessPolicy.ensureCanViewTale(tale, requester);

    return LocationDetailDTO.from(location, tale);
  }

  private Tale loadTaleForLocation(Location location) {
    UUID taleId = location.getTaleId();
    if (taleId == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found");
    }

    Tale tale = taleRepository.findById(taleId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    taleAccessPolicy.ensureNotSleeping(tale);
    return tale;
  }
}
