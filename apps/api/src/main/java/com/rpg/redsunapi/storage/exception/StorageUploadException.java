package com.rpg.redsunapi.storage.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class StorageUploadException extends ResponseStatusException {
  public StorageUploadException(String reason, Throwable cause) {
    super(HttpStatus.BAD_GATEWAY, reason, cause);
  }
}
