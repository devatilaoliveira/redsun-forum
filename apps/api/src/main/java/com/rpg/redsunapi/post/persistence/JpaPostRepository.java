package com.rpg.redsunapi.post.persistence;

import com.rpg.redsunapi.post.Post;
import com.rpg.redsunapi.post.enums.EPostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JpaPostRepository extends JpaRepository<Post, UUID> {

  @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.id = :postId")
  Optional<Post> findById(UUID postId);

  @Query("SELECT p FROM Post p JOIN FETCH p.author WHERE p.locationId = :locationId ORDER BY p.creationDate DESC")
  List<Post> findByLocationId(UUID locationId);

  @EntityGraph(attributePaths = "author")
  Page<Post> findByLocationId(UUID locationId, Pageable pageable);

  @EntityGraph(attributePaths = "author")
  Page<Post> findByLocationIdAndStatus(UUID locationId, EPostStatus status, Pageable pageable);
}
