package com.rpg.redsunapi.storage.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class InvalidImageException extends ResponseStatusException {
  public InvalidImageException(String reason) {
    super(HttpStatus.BAD_REQUEST, reason);
  }
}
