package com.rpg.redsunapi.development;

import com.rpg.redsunapi.authentication.AuthenticatedUser;
import com.rpg.redsunapi.post.dto.PostDTO;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@Validated
@RequestMapping("/development")
@NullMarked
public class DevelopmentController {

  private final DevelopmentService developmentService;

  public DevelopmentController(DevelopmentService developmentService) {
    this.developmentService = developmentService;
  }

  @GetMapping("/tales/{taleId}/search-posts")
  public ResponseEntity<List<PostDTO>> searchPosts(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable UUID taleId,
    @RequestParam(required = false) @Nullable String characterName,
    @RequestParam(required = false) @Nullable String content
  ) {
    return ResponseEntity.ok(developmentService.searchPosts(taleId, principal.user(), characterName, content));
  }
}
