package com.rpg.redsunapi.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class LocationStorageService extends BaseStorageService {

  public LocationStorageService(
    StorageClient storageClient,
    @Value("${supabase.storage-url}") String publicBaseUrl,
    @Value("${supabase.bucket.locations}") String bucket
  ) {
    super(storageClient, publicBaseUrl, bucket);
  }

  public String uploadLocationImage(UUID locationId, MultipartFile file) throws IOException {
    return storageClient.uploadImage(bucket, publicBaseUrl, locationId, file, 2 * 1024 * 1024L);
  }

  public void deleteLocation(UUID locationId, String publicUrl) {
    if (locationId == null) {
      return;
    }
    String objectPath = extractObjectPathFromUrl(publicUrl, locationId);
    if (objectPath == null) {
      return;
    }
    storageClient.delete(bucket, objectPath);
  }
}
