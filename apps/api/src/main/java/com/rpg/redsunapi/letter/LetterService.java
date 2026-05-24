package com.rpg.redsunapi.letter;

import com.rpg.redsunapi.letter.dto.LetterCreateRequestDTO;
import com.rpg.redsunapi.user.User;
import com.rpg.redsunapi.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class LetterService {

  private static final int MAX_PAGE_SIZE = 10;

  private final LetterRepository letterRepository;
  private final UserRepository userRepository;

  public LetterService(LetterRepository letterRepository, UserRepository userRepository) {
    this.letterRepository = letterRepository;
    this.userRepository = userRepository;
  }

  @Transactional
  public Letter createLetter(LetterCreateRequestDTO request, User sender) {
    if (sender == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
    }
    if (request == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
    }

    List<UUID> recipientIds = request.recipientsIds();
    if (recipientIds == null || recipientIds.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one recipient is required");
    }

    Set<User> recipients = new HashSet<>();
    for (UUID recipientId : recipientIds) {
      if (recipientId == null) {
        continue;
      }
      User recipient = userRepository.findById(recipientId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
      recipients.add(recipient);
    }

    if (recipients.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one recipient is required");
    }

    User senderEntity = userRepository.findById(sender.getId()).orElse(sender);

    Letter letter = new Letter();
    letter.setSender(senderEntity);
    letter.setRecipients(recipients);
    letter.setReadBy(new HashSet<>());
    letter.setSentAt(OffsetDateTime.now());
    letter.setSubject(request.subject());
    letter.setContent(request.content());

    return letterRepository.save(letter);
  }

  @Transactional(readOnly = true)
  public Page<Letter> listSentLettersForUser(User user, int page, int size) {
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
    }

    Pageable pageable = buildPageable(page, size);
    return letterRepository.findSentLettersForUser(user.getId(), pageable);
  }

  @Transactional(readOnly = true)
  public Page<Letter> listReceivedLettersForUser(User user, int page, int size) {
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
    }

    Pageable pageable = buildPageable(page, size);
    return letterRepository.findReceivedLettersForUser(user.getId(), pageable);
  }

  @Transactional
  public Letter findLetterById(UUID letterId, User requester) {
    if (requester == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User must be authenticated");
    }

    Letter letter = letterRepository.findById(letterId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Letter not found"));

    if (!isSenderOrRecipient(letter, requester.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to view this letter");
    }
    if (isRecipient(letter, requester.getId())) {
      this.markAsRead(letter, requester);
    }

    return letter;
  }

  private void markAsRead(Letter letter, User requester) {
    Set<User> readBy = letter.getReadBy();
    User reader = userRepository.findById(requester.getId()).orElse(requester);
    readBy.add(reader);
  }

  @Transactional
  public int deleteLettersOlderThan(OffsetDateTime cutoff) {
    if (cutoff == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cutoff time is required");
    }

    return letterRepository.deleteLettersOlderThan(cutoff);
  }

  private boolean isSenderOrRecipient(Letter letter, UUID userId) {
    return isSender(letter, userId) || isRecipient(letter, userId);
  }

  private boolean isSender(Letter letter, UUID userId) {
    return letter.getSender() != null && userId.equals(letter.getSender().getId());
  }

  private boolean isRecipient(Letter letter, UUID userId) {
    return letter.getRecipients() != null && letter.getRecipients().stream()
      .anyMatch(recipient -> userId.equals(recipient.getId()));
  }

  private Pageable buildPageable(int page, int size) {
    int safePage = Math.max(page, 0);
    int boundedSize = size <= 0 ? MAX_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
    Sort sort = Sort.by(Sort.Order.desc("sentAt"), Sort.Order.desc("id"));
    return PageRequest.of(safePage, boundedSize, sort);
  }
}
