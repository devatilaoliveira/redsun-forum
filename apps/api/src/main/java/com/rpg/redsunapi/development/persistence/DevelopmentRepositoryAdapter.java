package com.rpg.redsunapi.development.persistence;

import com.rpg.redsunapi.development.DevelopmentRepository;
import com.rpg.redsunapi.post.Post;
import com.rpg.redsunapi.post.enums.EPostStatus;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class DevelopmentRepositoryAdapter implements DevelopmentRepository {

  private final JpaDevelopmentRepository jpaDevelopmentRepository;

  public DevelopmentRepositoryAdapter(JpaDevelopmentRepository jpaDevelopmentRepository) {
    this.jpaDevelopmentRepository = jpaDevelopmentRepository;
  }

  @Override
  public List<Post> findActivePostsByTaleId(
    UUID taleId,
    @Nullable String characterNameFilter,
    @Nullable String contentFilter
  ) {
    return jpaDevelopmentRepository.findPostsByTaleIdAndStatus(
      taleId,
      EPostStatus.ACTIVE,
      nullToEmpty(characterNameFilter),
      nullToEmpty(contentFilter)
    );
  }

  private String nullToEmpty(@Nullable String filter) {
    return filter == null ? "" : filter;
  }
}
