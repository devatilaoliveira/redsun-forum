package com.rpg.redsunapi.development.persistence;

import com.rpg.redsunapi.post.Post;
import com.rpg.redsunapi.post.enums.EPostStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface JpaDevelopmentRepository extends JpaRepository<Post, UUID> {

  @EntityGraph(attributePaths = "author")
  @Query("""
    SELECT p
    FROM Post p
    WHERE p.status = :status
      AND p.locationId IN (
        SELECT location.id
        FROM Location location
        WHERE location.taleId = :taleId
      )
      AND (
        :contentFilter IS NULL
        OR LOCATE(:contentFilter, LOWER(p.content)) > 0
      )
      AND (
        :characterNameFilter IS NULL
        OR EXISTS (
          SELECT sheet.id
          FROM BasicSheet sheet
          WHERE sheet.tale.id = :taleId
            AND sheet.characterId = p.author.id
            AND LOCATE(:characterNameFilter, LOWER(sheet.characterName)) > 0
        )
      )
    ORDER BY p.creationDate DESC, p.id DESC
    """)
  List<Post> findPostsByTaleIdAndStatus(
    UUID taleId,
    EPostStatus status,
    String characterNameFilter,
    String contentFilter
  );
}
