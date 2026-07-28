package com.rpg.redsunapi.post;

import com.rpg.redsunapi.authentication.AuthenticatedUser;
import com.rpg.redsunapi.post.dto.PostCreateRequestDTO;
import com.rpg.redsunapi.post.dto.PostDTO;
import com.rpg.redsunapi.post.dto.PostImproveTextRequestDTO;
import com.rpg.redsunapi.post.dto.PostImproveTextResponseDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@Validated
@RequestMapping("/posts")
@NullMarked
public class PostController {

  private final PostService postService;

  public PostController(PostService postService) {
    this.postService = postService;
  }

  @PostMapping
  public ResponseEntity<PostDTO> createPost(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @Valid @RequestBody PostCreateRequestDTO request
  ) {
    return ResponseEntity.status(HttpStatus.CREATED).body(postService.createPost(request, principal.user()));
  }

  @PostMapping("/improve-text")
  public ResponseEntity<PostImproveTextResponseDTO> improveText(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @Valid @RequestBody PostImproveTextRequestDTO request
  ) {
    String improvedContent = postService.improvePostText(request.content(), principal.user());
    return ResponseEntity.ok(new PostImproveTextResponseDTO(improvedContent));
  }

  @GetMapping
  public ResponseEntity<Page<PostDTO>> listPostsForLocation(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @RequestParam("locationId") @NotNull UUID locationId,
    @RequestParam(name = "page", defaultValue = "0") int page,
    @RequestParam(name = "size", defaultValue = "10") int size
  ) {
    return ResponseEntity.ok(postService.findPostsByLocation(locationId, principal.user(), page, size));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletePost(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("id") UUID postId
  ) {
    postService.deletePost(postId, principal.user());
    return ResponseEntity.ok().build();
  }

  @PostMapping("/{id}/inactive")
  public ResponseEntity<Void> deactivatePost(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable("id") UUID postId
  ) {
    postService.deactivatePost(postId, principal.user());
    return ResponseEntity.noContent().build();
  }
}
