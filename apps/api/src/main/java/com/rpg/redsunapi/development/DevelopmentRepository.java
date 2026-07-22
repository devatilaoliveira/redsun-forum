package com.rpg.redsunapi.development;

import com.rpg.redsunapi.post.Post;
import org.jspecify.annotations.Nullable;

import java.util.List;
import java.util.UUID;

public interface DevelopmentRepository {

  List<Post> findActivePostsByTaleId(
    UUID taleId,
    @Nullable String characterNameFilter,
    @Nullable String contentFilter
  );
}
