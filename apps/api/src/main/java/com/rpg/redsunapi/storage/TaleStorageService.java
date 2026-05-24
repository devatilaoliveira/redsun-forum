package com.rpg.redsunapi.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class TaleStorageService extends BaseStorageService {

  public TaleStorageService(
    StorageClient storageClient,
    @Value("${supabase.storage-url}") String publicBaseUrl,
    @Value("${supabase.bucket.tales}") String bucket
  ) {
    super(storageClient, publicBaseUrl, bucket);
  }

  public String uploadTaleImage(UUID taleId, MultipartFile file) throws IOException {
    return storageClient.uploadImage(bucket, publicBaseUrl, taleId, file, 2 * 1024 * 1024L);
  }

  public void deleteTale(UUID taleId, String publicUrl) {
    if (taleId == null) {
      return;
    }
    String objectPath = extractObjectPathFromUrl(publicUrl, taleId);
    if (objectPath == null) {
      return;
    }
    storageClient.delete(bucket, objectPath);
  }
}
