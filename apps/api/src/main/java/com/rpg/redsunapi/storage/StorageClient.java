package com.rpg.redsunapi.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

public interface StorageClient {

  String uploadImage(String bucket, String publicBaseUrl, String objectPrefix, MultipartFile file, long maxFileSizeBytes) throws IOException;

  default String uploadImage(String bucket, String publicBaseUrl, UUID resourceId, MultipartFile file, long maxFileSizeBytes) throws IOException {
    return uploadImage(bucket, publicBaseUrl, resourceId.toString(), file, maxFileSizeBytes);
  }

  void delete(String bucket, String objectPath);
}
