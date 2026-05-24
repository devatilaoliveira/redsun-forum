package com.rpg.redsunapi.supabase.exception;

public class SupabaseAuthException extends RuntimeException {

  public SupabaseAuthException(String message, Throwable cause) {
    super(message, cause);
  }
}
