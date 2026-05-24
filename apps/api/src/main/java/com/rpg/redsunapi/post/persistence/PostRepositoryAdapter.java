package com.rpg.redsunapi.post.persistence;

import com.rpg.redsunapi.post.Post;
import com.rpg.redsunapi.post.PostRepository;
import com.rpg.redsunapi.post.enums.EPostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PostRepositoryAdapter implements PostRepository {

  private final JpaPostRepository jpaPostRepository;

  public PostRepositoryAdapter(JpaPostRepository jpaPostRepository) {
    this.jpaPostRepository = jpaPostRepository;
  }

  @Override
  public Optional<Post> findById(UUID id) {
    return jpaPostRepository.findById(id);
  }

  @Override
  public List<Post> findByLocationId(UUID locationId) {
    return jpaPostRepository.findByLocationId(locationId);
  }

  @Override
  public Page<Post> findByLocationId(UUID locationId, Pageable pageable) {
    return jpaPostRepository.findByLocationId(locationId, pageable);
  }

  @Override
  public Page<Post> findByLocationIdAndStatus(UUID locationId, EPostStatus status, Pageable pageable) {
    return jpaPostRepository.findByLocationIdAndStatus(locationId, status, pageable);
  }

  @Override
  public Post save(Post post) {
    return jpaPostRepository.save(post);
  }

  @Override
  public void delete(Post post) {
    jpaPostRepository.delete(post);
  }
}
