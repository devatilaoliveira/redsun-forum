package com.rpg.redsunapi.post;

import com.rpg.redsunapi.location.Location;
import com.rpg.redsunapi.location.LocationRepository;
import com.rpg.redsunapi.post.dto.CreatedPostDTO;
import com.rpg.redsunapi.post.dto.PostCreateRequestDTO;
import com.rpg.redsunapi.post.enums.EPostStatus;
import com.rpg.redsunapi.subscription.Subscription;
import com.rpg.redsunapi.subscription.SubscriptionRepository;
import com.rpg.redsunapi.subscription.enums.ESubscriptionPlan;
import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.TaleAccessPolicy;
import com.rpg.redsunapi.tale.TaleRepository;
import com.rpg.redsunapi.user.User;
import com.rpg.redsunapi.user.UserRepository;
import org.jspecify.annotations.NullMarked;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@NullMarked
public class PostService {

  private static final int MAX_PAGE_SIZE = 10;

  private final PostRepository postRepository;
  private final LocationRepository locationRepository;
  private final TaleRepository taleRepository;
  private final UserRepository userRepository;
  private final SubscriptionRepository subscriptionRepository;
  private final GeminiPostTextClient geminiPostTextClient;
  private final TaleAccessPolicy taleAccessPolicy;

  public record PostsForLocation(Page<Post> posts, Tale tale) {
  }

  public PostService(
    PostRepository postRepository,
    LocationRepository locationRepository,
    TaleRepository taleRepository,
    UserRepository userRepository,
    SubscriptionRepository subscriptionRepository,
    GeminiPostTextClient geminiPostTextClient,
    TaleAccessPolicy taleAccessPolicy
  ) {
    this.postRepository = postRepository;
    this.locationRepository = locationRepository;
    this.taleRepository = taleRepository;
    this.userRepository = userRepository;
    this.subscriptionRepository = subscriptionRepository;
    this.geminiPostTextClient = geminiPostTextClient;
    this.taleAccessPolicy = taleAccessPolicy;
  }

  @Transactional
  public CreatedPostDTO createPost(PostCreateRequestDTO request, User author) {
    UUID locationId = request.locationId();
    String content = request.content();

    Location location = locationRepository.findById(locationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));

    Tale tale = loadTaleForLocation(location);
    taleAccessPolicy.ensureCanParticipateInTale(tale, author);

    User authorEntity = userRepository.findById(author.getId()).orElse(author);

    Post post = new Post();
    post.setAuthor(authorEntity);
    post.setLocationId(location.getId());
    post.setContent(content);
    post.setStatus(EPostStatus.ACTIVE);
    post.setType(request.type());

    OffsetDateTime now = OffsetDateTime.now();
    post.setCreationDate(now);

    location.setLastTimeActive(now);
    tale.setLastTimeActive(now);

    Post savedPost = postRepository.save(post);
    locationRepository.save(location);
    taleRepository.save(tale);

    return new CreatedPostDTO(savedPost, tale);
  }

  public String improvePostText(String content, User requester) {
    Subscription subscription = subscriptionRepository.findByUserId(requester.getId())
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Premium subscription is required"));

    if (subscription.getPlan() != ESubscriptionPlan.PREMIUM && subscription.getPlan() != ESubscriptionPlan.MAX) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Premium subscription is required");
    }

    return geminiPostTextClient.improvePostText(content);
  }

  @Transactional(readOnly = true)
  public PostsForLocation findPostsByLocation(UUID locationId, User requester, int page, int size) {
    Location location = locationRepository.findById(locationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));

    Tale tale = loadTaleForLocation(location);
    taleAccessPolicy.ensureCanViewTale(tale, requester);

    Pageable pageable = buildPageable(page, size);
    boolean isOwner = requester != null && tale.isOwnedBy(requester.getId());

    if (isOwner) {
      return new PostsForLocation(postRepository.findByLocationId(location.getId(), pageable), tale);
    }

    return new PostsForLocation(
      postRepository.findByLocationIdAndStatus(location.getId(), EPostStatus.ACTIVE, pageable),
      tale
    );
  }

  @Transactional(readOnly = true)
  public List<Post> findPostsForLocation(UUID locationId, User requester) {
    Location location = locationRepository.findById(locationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));

    Tale tale = loadTaleForLocation(location);
    taleAccessPolicy.ensureCanViewTale(tale, requester);

    return postRepository.findByLocationId(location.getId());
  }

  @Transactional(readOnly = true)
  public Post findPostById(UUID postId, User requester) {
    Post post = postRepository.findById(postId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

    UUID locationId = post.getLocationId();
    if (locationId == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found");
    }

    Location location = locationRepository.findById(locationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));

    Tale tale = loadTaleForLocation(location);
    taleAccessPolicy.ensureCanViewTale(tale, requester);

    return post;
  }

  @Transactional
  public void deletePost(UUID postId, User requester) {
    Post post = postRepository.findById(postId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

    UUID locationId = post.getLocationId();
    if (locationId == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found");
    }

    Location location = locationRepository.findById(locationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));

    Tale tale = loadTaleForLocation(location);
    ensureCanModeratePost(post, tale, requester, "You are not allowed to delete this post");

    postRepository.delete(post);
  }

  @Transactional
  public void deactivatePost(UUID postId, User requester) {
    Post post = postRepository.findById(postId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

    UUID locationId = post.getLocationId();
    if (locationId == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found");
    }

    Location location = locationRepository.findById(locationId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));

    Tale tale = loadTaleForLocation(location);
    ensureCanModeratePost(post, tale, requester, "You are not allowed to update this post");

    post.setStatus(EPostStatus.INACTIVE);
  }

  private void ensureCanModeratePost(Post post, Tale tale, User requester, String errorMessage) {
    UUID authorId = post.getAuthor() == null ? null : post.getAuthor().getId();
    taleAccessPolicy.ensureCanModerateContent(tale, requester, authorId, errorMessage);
  }

  private Tale loadTaleForLocation(Location location) {
    UUID taleId = location.getTaleId();
    if (taleId == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found");
    }

    Tale tale = taleRepository.findById(taleId)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tale not found"));

    taleAccessPolicy.ensureNotSleeping(tale);
    return tale;
  }

  private Pageable buildPageable(int page, int size) {
    int safePage = Math.max(page, 0);
    int boundedSize = size <= 0 ? MAX_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
    Sort sort = Sort.by(Sort.Order.desc("creationDate"), Sort.Order.desc("id"));
    return PageRequest.of(safePage, boundedSize, sort);
  }
}
