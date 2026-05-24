package com.rpg.redsunapi.letter.dto;

import com.rpg.redsunapi.letter.Letter;
import com.rpg.redsunapi.user.dto.UserAsContactDTO;

import java.time.OffsetDateTime;
import java.util.List;

public record LetterDTO(
  String id,
  UserAsContactDTO sender,
  List<UserAsContactDTO> recipients,
  List<UserAsContactDTO> readBy,
  OffsetDateTime sentAt,
  String subject,
  String content
) {

  public static LetterDTO from(Letter letter) {
    String id = letter.getId() != null ? letter.getId().toString() : null;
    UserAsContactDTO sender = letter.getSender() != null ? UserAsContactDTO.from(letter.getSender()) : null;
    List<UserAsContactDTO> recipients = letter.getRecipients() == null
      ? List.of()
      : letter.getRecipients().stream().map(UserAsContactDTO::from).toList();
    List<UserAsContactDTO> readBy = letter.getReadBy() == null
      ? List.of()
      : letter.getReadBy().stream().map(UserAsContactDTO::from).toList();
    return new LetterDTO(
      id,
      sender,
      recipients,
      readBy,
      letter.getSentAt(),
      letter.getSubject(),
      letter.getContent()
    );
  }
}
