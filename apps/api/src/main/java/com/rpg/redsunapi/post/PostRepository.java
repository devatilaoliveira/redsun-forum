package com.rpg.redsunapi.post;

import com.rpg.redsunapi.post.enums.EPostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PostRepository {

  Optional<Post> findById(UUID id);

  List<Post> findByLocationId(UUID locationId);

  Page<Post> findByLocationId(UUID locationId, Pageable pageable);

  Page<Post> findByLocationIdAndStatus(UUID locationId, EPostStatus status, Pageable pageable);

  Post save(Post post);

  void delete(Post post);
}
