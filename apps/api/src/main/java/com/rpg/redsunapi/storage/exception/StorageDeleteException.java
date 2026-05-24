package com.rpg.redsunapi.storage.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class StorageDeleteException extends ResponseStatusException {
  public StorageDeleteException(String reason, Throwable cause) {
    super(HttpStatus.BAD_GATEWAY, reason, cause);
  }
}
