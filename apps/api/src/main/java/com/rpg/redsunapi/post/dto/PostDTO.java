package com.rpg.redsunapi.post.dto;

import com.rpg.redsunapi.post.Post;
import com.rpg.redsunapi.post.enums.EPostStatus;
import com.rpg.redsunapi.post.enums.EPostType;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.dto.TaleParticipantProfileDTO;

import java.time.OffsetDateTime;

public record PostDTO(
  String id,
  TaleParticipantProfileDTO author,
  String locationId,
  String taleId,
  String content,
  EPostStatus status,
  EPostType type,
  OffsetDateTime creationDate
) {
  public static PostDTO from(Post post, Tale tale) {
    String id = post.getId() != null ? post.getId().toString() : null;
    TaleParticipantProfileDTO author = TaleParticipantProfileDTO.from(post.getAuthor(), tale);
    String locationId = post.getLocationId() != null
      ? post.getLocationId().toString()
      : null;
    String taleId = tale != null && tale.getId() != null ? tale.getId().toString() : null;
    EPostStatus status = post.getStatus() != null ? post.getStatus() : EPostStatus.ACTIVE;
    EPostType type = post.getType();
    return new PostDTO(
      id,
      author,
      locationId,
      taleId,
      post.getContent(),
      status,
      type,
      post.getCreationDate()
    );
  }
}
