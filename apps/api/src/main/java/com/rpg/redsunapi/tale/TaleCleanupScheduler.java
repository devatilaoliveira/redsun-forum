package com.rpg.redsunapi.tale;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
public class TaleCleanupScheduler {

  private static final int RETENTION_DAYS = 60;

  private final TaleService taleService;

  public TaleCleanupScheduler(TaleService taleService) {
    this.taleService = taleService;
  }

  @Scheduled(cron = "0 0 3 1 * *")
  public void purgeOldSleepTales() {
    OffsetDateTime cutoff = OffsetDateTime.now().minusDays(RETENTION_DAYS);
    taleService.deleteSleepTalesOlderThan(cutoff);
  }
}
