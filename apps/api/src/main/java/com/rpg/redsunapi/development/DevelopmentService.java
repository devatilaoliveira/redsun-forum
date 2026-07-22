package com.rpg.redsunapi.development;

import com.rpg.redsunapi.post.dto.PostDTO;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.TaleAccessPolicy;
import com.rpg.redsunapi.tale.TaleRepository;
import com.rpg.redsunapi.user.User;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@NullMarked
public class DevelopmentService {

  private final DevelopmentRepository developmentRepository;
  private final TaleRepository taleRepository;
  private final TaleAccessPolicy taleAccessPolicy;

  public DevelopmentService(
    DevelopmentRepository developmentRepository,
    TaleRepository taleRepository,
    TaleAccessPolicy taleAccessPolicy
  ) {
    this.developmentRepository = developmentRepository;
    this.taleRepository = taleRepository;
    this.taleAccessPolicy = taleAccessPolicy;
  }

  @Transactional(readOnly = true)
  public List<PostDTO> searchPosts(
    UUID taleId,
    User requester,
    @Nullable String characterName,
    @Nullable String content
  ) {
    Tale tale = taleRepository.findById(taleId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    taleAccessPolicy.ensureNotSleeping(tale);
    taleAccessPolicy.ensureCanManageTale(tale, requester);

    String characterNameFilter = normalizeFilter(characterName);
    String contentFilter = normalizeFilter(content);

    return developmentRepository.findActivePostsByTaleId(taleId, characterNameFilter, contentFilter).stream()
      .map(post -> PostDTO.from(post, tale))
      .toList();
  }

  private @Nullable String normalizeFilter(@Nullable String filter) {
    if (filter == null || filter.isBlank()) {
      return null;
    }
    String normalized = filter.trim().toLowerCase(Locale.ROOT);
    if (normalized.length() < 3) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Search filters must contain at least 3 characters");
    }
    return normalized;
  }
}
