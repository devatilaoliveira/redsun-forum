package com.rpg.redsunapi.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class CharacterStorageService extends BaseStorageService {

  public CharacterStorageService(
    StorageClient storageClient,
    @Value("${supabase.storage-url}") String publicBaseUrl,
    @Value("${supabase.bucket.characters}") String bucket
  ) {
    super(storageClient, publicBaseUrl, bucket);
  }

  public String uploadCharacterImage(UUID taleId, UUID characterSheetId, MultipartFile file) throws IOException {
    String objectPrefix = "%s/%s".formatted(taleId, characterSheetId);
    return storageClient.uploadImage(bucket, publicBaseUrl, objectPrefix, file, 2 * 1024 * 1024L);
  }

  public void deleteCharacterImageByUrl(UUID taleId, UUID characterSheetId, String publicUrl) {
    if (taleId == null || characterSheetId == null) {
      return;
    }
    String objectPath = extractCharacterObjectPathFromUrl(publicUrl, taleId, characterSheetId);
    if (objectPath == null) {
      return;
    }
    storageClient.delete(bucket, objectPath);
  }

  private String extractCharacterObjectPathFromUrl(String url, UUID taleId, UUID characterSheetId) {
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
    String expectedPrefix = "%s/%s/".formatted(taleId, characterSheetId);
    if (!objectPath.startsWith(expectedPrefix)) {
      return null;
    }
    return objectPath;
  }
}
