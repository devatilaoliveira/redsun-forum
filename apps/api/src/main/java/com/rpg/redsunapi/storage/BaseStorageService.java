package com.rpg.redsunapi.storage;

import java.util.UUID;

public abstract class BaseStorageService {

  protected final StorageClient storageClient;
  protected final String publicBaseUrl;
  protected final String bucket;

  protected BaseStorageService(StorageClient storageClient, String publicBaseUrl, String bucket) {
    this.storageClient = storageClient;
    this.publicBaseUrl = publicBaseUrl;
    this.bucket = bucket;
  }

  protected String extractObjectPathFromUrl(String url, UUID resourceId) {
    if (resourceId == null) {
      return null;
    }
    if (url == null || url.isBlank()) {
      return null;
    }
    String normalizedBaseUrl = publicBaseUrl.endsWith("/")
      ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1)
      : publicBaseUrl;
    String prefix = "%s/%s/".formatted(normalizedBaseUrl, bucket);
    if (!url.startsWith(prefix)) {
      return null;
    }
    String objectPath = url.substring(prefix.length());
    String expectedPrefix = resourceId + "/";
    if (!objectPath.startsWith(expectedPrefix)) {
      return null;
    }
    return objectPath;
  }
}
