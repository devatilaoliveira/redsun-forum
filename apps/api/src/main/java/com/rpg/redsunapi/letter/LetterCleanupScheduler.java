package com.rpg.redsunapi.letter;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
public class LetterCleanupScheduler {

  private static final int RETENTION_DAYS = 60;

  private final LetterService letterService;

  public LetterCleanupScheduler(LetterService letterService) {
    this.letterService = letterService;
  }

  @Scheduled(cron = "0 0 3 * * *")
  public void purgeOldLetters() {
    OffsetDateTime cutoff = OffsetDateTime.now().minusDays(RETENTION_DAYS);
    letterService.deleteLettersOlderThan(cutoff);
  }
}
