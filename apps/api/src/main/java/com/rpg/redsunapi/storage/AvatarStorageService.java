package com.rpg.redsunapi.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class AvatarStorageService extends BaseStorageService {

  public AvatarStorageService(
    StorageClient storageClient,
    @Value("${supabase.storage-url}") String publicBaseUrl,
    @Value("${supabase.bucket.avatars}") String bucket
  ) {
    super(storageClient, publicBaseUrl, bucket);
  }

  public String uploadAvatar(UUID userId, MultipartFile file) throws IOException {
    return storageClient.uploadImage(bucket, publicBaseUrl, userId, file, 2 * 1024 * 1024L);
  }

  public void deleteAvatarByUrl(UUID userId, String publicUrl) {
    if (userId == null) {
      return;
    }
    String objectPath = extractObjectPathFromUrl(publicUrl, userId);
    if (objectPath == null) {
      return;
    }
    storageClient.delete(bucket, objectPath);
  }
}
