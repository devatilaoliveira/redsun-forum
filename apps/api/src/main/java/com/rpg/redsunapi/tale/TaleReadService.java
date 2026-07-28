package com.rpg.redsunapi.tale;

import com.rpg.redsunapi.location.Location;
import com.rpg.redsunapi.location.LocationRepository;
import com.rpg.redsunapi.tale.dto.TaleDetailDTO;
import com.rpg.redsunapi.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class TaleReadService {

  private static final int RECENT_LOCATIONS_LIMIT = 5;

  private final TaleRepository taleRepository;
  private final LocationRepository locationRepository;
  private final TaleAccessPolicy taleAccessPolicy;

  public TaleReadService(
    TaleRepository taleRepository,
    LocationRepository locationRepository,
    TaleAccessPolicy taleAccessPolicy
  ) {
    this.taleRepository = taleRepository;
    this.locationRepository = locationRepository;
    this.taleAccessPolicy = taleAccessPolicy;
  }

  @Transactional(readOnly = true)
  public TaleDetailDTO findTaleDetailById(UUID taleId, User requester) {
    Tale tale = taleRepository.findById(taleId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    taleAccessPolicy.ensureNotSleeping(tale);
    taleAccessPolicy.ensureCanViewTale(tale, requester);

    List<Location> recentLocations = locationRepository.findRecentByTaleId(
      tale.getId(),
      RECENT_LOCATIONS_LIMIT
    );

    return TaleDetailDTO.fromWithRecentLocations(
      tale,
      recentLocations,
      RECENT_LOCATIONS_LIMIT
    );
  }
}
