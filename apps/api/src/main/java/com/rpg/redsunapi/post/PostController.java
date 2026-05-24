package com.rpg.redsunapi.post;

import com.rpg.redsunapi.authentication.AuthenticatedUser;
import com.rpg.redsunapi.post.dto.CreatedPostDTO;
import com.rpg.redsunapi.post.dto.PostCreateRequestDTO;
import com.rpg.redsunapi.post.dto.PostDTO;
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
    CreatedPostDTO createdPost = postService.createPost(request, principal.user());
    return ResponseEntity.status(HttpStatus.CREATED).body(PostDTO.from(createdPost.post(), createdPost.tale()));
  }

  @GetMapping
  public ResponseEntity<Page<PostDTO>> listPostsForLocation(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @RequestParam("locationId") @NotNull UUID locationId,
    @RequestParam(name = "page", defaultValue = "0") int page,
    @RequestParam(name = "size", defaultValue = "10") int size
  ) {
    PostService.PostsForLocation postsForLocation = postService.findPostsByLocation(
      locationId,
      principal.user(),
      page,
      size
    );
    Page<PostDTO> posts = postsForLocation.posts()
      .map(post -> PostDTO.from(post, postsForLocation.tale()));
    return ResponseEntity.ok(posts);
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
