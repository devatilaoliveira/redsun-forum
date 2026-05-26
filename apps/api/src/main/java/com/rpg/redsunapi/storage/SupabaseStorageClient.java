package com.rpg.redsunapi.storage;

import com.rpg.redsunapi.storage.exception.InvalidImageException;
import com.rpg.redsunapi.storage.exception.StorageDeleteException;
import com.rpg.redsunapi.storage.exception.StorageUploadException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class SupabaseStorageClient implements StorageClient {

  private final RestClient client;

  public SupabaseStorageClient(String baseUrl, String secretKey) {
    this.client = RestClient.builder()
      .baseUrl(baseUrl + "/storage/v1")
      .defaultHeader("apikey", secretKey)
      .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + secretKey)
      .build();
  }

  public void upload(String bucket, String objectPath, byte[] data, String contentType) {
    try {
      client.post()
        .uri("/object/{bucket}/{path}", bucket, objectPath)
        .contentType(MediaType.parseMediaType(contentType))
        .body(data)
        .retrieve()
        .toBodilessEntity();
    } catch (RestClientResponseException ex) {
      throw new StorageUploadException("Storage service rejected the upload request", ex);
    } catch (ResourceAccessException ex) {
      throw new StorageUploadException("Unable to reach storage service to upload image", ex);
    }
  }

  @Override
  public String uploadImage(
    String bucket,
    String publicBaseUrl,
    String objectPrefix,
    MultipartFile file,
    long maxFileSizeBytes
  ) {
    String contentType = validateImage(file, maxFileSizeBytes);
    String extension = contentType.equals("image/png") ? "png" : "jpg";
    long randomSuffix = ThreadLocalRandom.current().nextLong(1000, 9999);
    String normalizedPrefix = objectPrefix == null ? "" : objectPrefix.trim();
    if (normalizedPrefix.isEmpty()) {
      throw new InvalidImageException("Storage object prefix is required");
    }
    normalizedPrefix = normalizedPrefix
      .replace('\\', '/')
      .replaceAll("^/+", "")
      .replaceAll("/+$", "");
    String objectPath = "%s/%d.%s".formatted(normalizedPrefix, randomSuffix, extension);

    byte[] data;
    try {
      data = file.getBytes();
    } catch (IOException ex) {
      throw new StorageUploadException("Could not read image data", ex);
    }

    upload(bucket, objectPath, data, contentType);
    String normalizedBaseUrl = publicBaseUrl.endsWith("/")
      ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1)
      : publicBaseUrl;
    return "%s/%s/%s".formatted(normalizedBaseUrl, bucket, objectPath);
  }

  private String validateImage(MultipartFile file, long maxSizeBytes) {
    if (file == null || file.isEmpty()) {
      throw new InvalidImageException("Image file is required");
    }
    if (file.getSize() > maxSizeBytes) {
      throw new InvalidImageException("Image exceeds the maximum allowed size of " + readableSize(maxSizeBytes));
    }
    String contentType = file.getContentType();
    if (!List.of("image/jpeg", "image/png").contains(contentType)) {
      throw new InvalidImageException("Only JPEG and PNG images are supported");
    }
    return contentType;
  }

  private String readableSize(long maxSizeBytes) {
    long megabytes = maxSizeBytes / (1024 * 1024);
    if (megabytes > 0) {
      return megabytes + "MB";
    }
    long kilobytes = Math.max(1, maxSizeBytes / 1024);
    return kilobytes + "KB";
  }

  @Override
  public void delete(String bucket, String objectPath) {
    if (objectPath == null || objectPath.isBlank()) {
      return;
    }

    try {
      client.delete()
        .uri("/object/{bucket}/{path}", bucket, objectPath)
        .retrieve()
        .toBodilessEntity()
        .getBody();
    } catch (RestClientResponseException ex) {
      if (ex.getStatusCode().value() == HttpStatus.NOT_FOUND.value()) {
        return;
      }
      throw new StorageDeleteException("Storage service rejected the delete request", ex);
    } catch (ResourceAccessException ex) {
      throw new StorageDeleteException("Unable to reach storage service to delete image", ex);
    }
  }
}
