package com.rpg.redsunapi.user;

import com.rpg.redsunapi.authentication.AuthenticationConstants;
import com.rpg.redsunapi.authentication.Provider;
import com.rpg.redsunapi.legal.LegalDocumentService;
import com.rpg.redsunapi.storage.AvatarStorageService;
import com.rpg.redsunapi.subscription.Subscription;
import com.rpg.redsunapi.subscription.SubscriptionRepository;
import com.rpg.redsunapi.supabase.SupabaseAuthAdminClient;
import com.rpg.redsunapi.supabase.exception.SupabaseAuthException;
import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import com.rpg.redsunapi.user.dto.MeRequestDto;
import com.rpg.redsunapi.user.dto.MeResponseDto;
import com.rpg.redsunapi.user.dto.UserAsContactDTO;
import com.rpg.redsunapi.user.dto.UserAsContactProfileDTO;
import com.rpg.redsunapi.utils.GeneralUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@NullMarked
public class UserService {
  private static final Logger log = LoggerFactory.getLogger(UserService.class);
  private static final int MAX_PAGE_SIZE = 10;
  private static final String DELETED_USERNAME_PREFIX = "deleted-";
  private static final String DELETED_EMAIL_DOMAIN = "redsun.invalid";
  private final AvatarStorageService avatarStorageService;
  private final UserRepository userRepository;
  private final SubscriptionRepository subscriptionRepository;
  private final SupabaseAuthAdminClient supabaseAuthAdminClient;
  private final LegalDocumentService legalDocumentService;

  public UserService(
      UserRepository userRepository,
      SubscriptionRepository subscriptionRepository,
      AvatarStorageService avatarStorageService,
      SupabaseAuthAdminClient supabaseAuthAdminClient,
      LegalDocumentService legalDocumentService) {
    this.userRepository = userRepository;
    this.subscriptionRepository = subscriptionRepository;
    this.avatarStorageService = avatarStorageService;
    this.supabaseAuthAdminClient = supabaseAuthAdminClient;
    this.legalDocumentService = legalDocumentService;
  }

  @Transactional
  public User upsertUser(UUID userId, String email, Provider provider) {
    Objects.requireNonNull(provider, "provider");
    String normalizedEmail = GeneralUtil.normalizeEmail(email);
    if (normalizedEmail == null || normalizedEmail.isBlank()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
    }

    User user = userRepository.findById(userId).orElse(null);
    if (user != null) {
      if (user.isDeleted()) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is deleted");
      }
      if (user.getProvider() != provider) {
        user.setProvider(provider);
        return userRepository.save(user);
      }
      return user;
    }
    return createUser(userId, normalizedEmail, provider);
  }

  private User createUser(UUID userId, String email, Provider provider) {
    String userName = userRepository.nextUsername(AuthenticationConstants.USERNAME_PREFIX);

    User user = new User();
    user.setId(userId);
    user.setEmail(email);
    user.setProvider(provider);
    user.setUsername(userName);

    User savedUser = userRepository.save(user);
    subscriptionRepository.save(new Subscription(savedUser));
    return savedUser;
  }

  @Transactional(readOnly = true)
  public MeResponseDto toMeResponse(User user, List<UserAsContactDTO> contacts) {
    User responseUser = userRepository.findById(user.getId()).orElse(user);
    Subscription subscription = getSubscriptionForUser(responseUser.getId());
    return MeResponseDto.from(
        responseUser,
        contacts,
        subscription,
        legalDocumentService.currentTermsVersion(),
        legalDocumentService.currentPrivacyVersion()
    );
  }

  @Transactional
  public MeResponseDto acknowledgeCurrentLegalDocuments(UUID userId) {
    User user = userRepository.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    ensureActiveUser(user);

    OffsetDateTime now = OffsetDateTime.now();
    user.setTermsAcceptedAt(now);
    user.setTermsVersion(legalDocumentService.currentTermsVersion());
    user.setPrivacyAcknowledgedAt(now);
    user.setPrivacyVersion(legalDocumentService.currentPrivacyVersion());

    User savedUser = userRepository.save(user);
    List<UserAsContactDTO> contacts = getContactsForUser(savedUser.getId());
    return toMeResponse(savedUser, contacts);
  }

  private Subscription getSubscriptionForUser(UUID userId) {
    return subscriptionRepository.findByUserId(userId)
        .orElseThrow(() -> new IllegalStateException("Missing subscription for user " + userId));
  }

  @Transactional
  public User updateAvatar(UUID userId, MultipartFile file) throws IOException {
    User user = userRepository.findById(userId).orElseThrow();
    ensureActiveUser(user);
    String oldImageUrl = user.getImageURL();
    String newImageUrl = null;

    try {
      newImageUrl = avatarStorageService.uploadAvatar(userId, file);
      if (newImageUrl.equals(oldImageUrl)) {
        return user;
      }
      user.setImageURL(newImageUrl);
      User saved = userRepository.save(user);
      deleteAvatarIfPresent(userId, oldImageUrl);
      return saved;
    } catch (Exception ex) {
      if (newImageUrl != null) {
        try {
          avatarStorageService.deleteAvatarByUrl(userId, newImageUrl);
        } catch (Exception exception) {
          log.warn("Failed to cleanup newly uploaded avatar {}", newImageUrl, exception);
        }
      }
      throw ex;
    }
  }

  private void deleteAvatarIfPresent(UUID userId, @Nullable String imageUrl) {
    if (imageUrl == null || imageUrl.isBlank()) {
      return;
    }
    avatarStorageService.deleteAvatarByUrl(userId, imageUrl);
  }

  @Transactional
  public boolean deleteAvatar(UUID userId) {
    User user = userRepository.findById(userId).orElseThrow();
    ensureActiveUser(user);
    String imageUrl = user.getImageURL();
    if (imageUrl == null || imageUrl.isBlank()) {
      return false;
    }

    user.setImageURL(null);
    userRepository.save(user);
    try {
      avatarStorageService.deleteAvatarByUrl(userId, imageUrl);
    } catch (Exception ex) {
      log.warn("Failed to delete avatar {} for user {}", imageUrl, userId, ex);
    }
    return true;
  }

  @Transactional
  public UserAsContactDTO addContactByEmail(UUID userId, String email) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    ensureActiveUser(user);

    String normalizedEmail = email.trim();
    if (user.getEmail().equalsIgnoreCase(normalizedEmail)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot add yourself");
    }

    User contact = userRepository.findByEmail(normalizedEmail)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    ensureActiveContact(contact);

    Set<User> contactsList = user.getContactsList();
    if (contactsList == null) {
      contactsList = new HashSet<>();
      user.setContactsList(contactsList);
    }

    contactsList.add(contact);
    userRepository.save(user);

    return UserAsContactDTO.from(contact);
  }

  @Transactional
  public UserAsContactDTO addContactByIdentifier(UUID userId, String identifier) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    ensureActiveUser(user);

    String normalizedIdentifier = identifier.trim();
    User contact = normalizedIdentifier.contains("@")
        ? userRepository.findByEmail(normalizedIdentifier)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"))
        : userRepository.findByUsername(normalizedIdentifier)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    ensureActiveContact(contact);

    if (user.getId().equals(contact.getId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot add yourself");
    }

    Set<User> contactsList = user.getContactsList();
    if (contactsList == null) {
      contactsList = new HashSet<>();
      user.setContactsList(contactsList);
    }

    contactsList.add(contact);
    userRepository.save(user);

    return UserAsContactDTO.from(contact);
  }

  @Transactional
  public UserAsContactDTO addContactById(UUID userId, UUID contactId) {
    if (contactId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contact id is required");
    }

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    ensureActiveUser(user);

    if (user.getId().equals(contactId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot add yourself");
    }

    User contact = userRepository.findById(contactId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    ensureActiveContact(contact);

    Set<User> contactsList = user.getContactsList();
    if (contactsList == null) {
      contactsList = new HashSet<>();
      user.setContactsList(contactsList);
    }

    contactsList.add(contact);
    userRepository.save(user);

    return UserAsContactDTO.from(contact);
  }

  @Transactional
  public boolean removeContactById(UUID userId, UUID contactId) {
    if (contactId == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contact id is required");
    }

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    ensureActiveUser(user);

    if (user.getId().equals(contactId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot remove yourself");
    }

    Set<User> contactsList = user.getContactsList();
    if (contactsList == null || contactsList.isEmpty()) {
      return false;
    }

    boolean removed = contactsList.removeIf(contact -> contactId.equals(contact.getId()));
    if (removed) {
      userRepository.save(user);
    }
    return removed;
  }

  @Transactional(readOnly = true)
  public List<UserAsContactDTO> getContactsForUser(UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    ensureActiveUser(user);

    Set<User> contacts = userRepository.findContacts(user.getId());
    return contacts.stream()
        .filter(contact -> contact != null && !contact.isDeleted())
        .map(UserAsContactDTO::from)
        .toList();
  }

  @Transactional(readOnly = true)
  public UserAsContactProfileDTO getContactProfile(UUID userId, UUID contactId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    ensureActiveUser(user);

    User contact = userRepository.findById(contactId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    ensureActiveContact(contact);

    return UserAsContactProfileDTO.from(contact);
  }

  @Transactional
  public User updateMe(UUID userId, MeRequestDto request) {
    if (request == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
    }

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    ensureActiveUser(user);

    boolean hasUpdate = false;

    if (request.username() != null) {
      String normalizedUsername = request.username().trim();
      if (normalizedUsername.isEmpty()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
      }
      if (normalizedUsername.length() > 20) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username must be at most 20 characters");
      }
      if (!normalizedUsername.matches("^[A-Za-z0-9]+$")) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username may contain only letters and numbers");
      }
      userRepository.findByUsername(normalizedUsername)
          .filter(existing -> !existing.getId().equals(user.getId()))
          .ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken");
          });
      if (!normalizedUsername.equals(user.getUsername())) {
        user.setUsername(normalizedUsername);
        hasUpdate = true;
      }
    }

    if (request.description() != null) {
      user.setDescription(request.description());
      hasUpdate = true;
    }

    if (request.favoriteLanguage() != null) {
      ensureFavoriteLimit("favoriteLanguage", request.favoriteLanguage());
      user.setFavoriteLanguage(request.favoriteLanguage());
      hasUpdate = true;
    }

    if (request.favoriteRules() != null) {
      ensureFavoriteLimit("favoriteRules", request.favoriteRules());
      user.setFavoriteRules(request.favoriteRules());
      hasUpdate = true;
    }

    if (request.favoriteRole() != null) {
      ensureFavoriteLimit("favoriteRole", request.favoriteRole());
      user.setFavoriteRole(request.favoriteRole());
      hasUpdate = true;
    }

    if (!hasUpdate) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No updates provided");
    }

    // Guard against concurrent updates hitting the DB unique constraint for
    // username.
    try {
      return userRepository.save(user);
    } catch (DataIntegrityViolationException ex) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken", ex);
    }
  }

  @Transactional
  public boolean deleteMe(UUID userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

    if (user.isDeleted()) {
      return true;
    }

    try {
      supabaseAuthAdminClient.deleteUser(userId);
    } catch (SupabaseAuthException ex) {
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY,
          "Unable to delete user from authentication service",
          ex);
    }

    String imageUrl = user.getImageURL();
    user.setImageURL(null);
    user.setDescription(null);
    user.setFavoriteLanguage(List.of());
    user.setFavoriteRules(List.of());
    user.setFavoriteRole(List.of());
    if (user.getContactsList() != null) {
      user.getContactsList().clear();
    }
    userRepository.removeFromContactLists(userId);

    user.setEmail(buildDeletedEmail(userId));
    user.setUsername(buildDeletedUsername(userId));
    user.setDeleted(true);
    user.setDeletedAt(OffsetDateTime.now());
    userRepository.save(user);

    try {
      deleteAvatarIfPresent(userId, imageUrl);
    } catch (Exception ex) {
      log.warn("Failed to delete avatar {} for user {}", imageUrl, userId, ex);
    }

    return true;
  }

  @Transactional(readOnly = true)
  public Page<User> findUsers(
      UUID requesterId,
      int page,
      int size,
      @Nullable String username,
      @Nullable String role,
      @Nullable String rule,
      @Nullable String language) {
    User requester = userRepository.findById(requesterId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    ensureActiveUser(requester);

    int safePage = Math.max(page, 0);
    int boundedSize = size <= 0 ? MAX_PAGE_SIZE : Math.min(size, MAX_PAGE_SIZE);
    Sort sort = Sort.by(
        Sort.Order.desc("lastSignInAt").nullsLast(),
        Sort.Order.asc("username")
    );
    Pageable pageable = PageRequest.of(safePage, boundedSize, sort);

    Page<User> users = userRepository.searchUsers(
        requesterId,
        username == null ? null : GeneralUtil.trimRequired(username),
        role == null ? null : parseRole(role),
        rule == null ? null : parseRule(rule),
        language == null ? null : parseLanguage(language),
        pageable);
    users.forEach(UserService::initializeUserSearchCollections);
    return users;
  }

  @Transactional
  public DeleteUsersByEmailResult deleteUsersByEmails(List<String> emails) {
    Set<String> normalizedEmails = new LinkedHashSet<>();
    for (String email : emails) {
      String normalizedEmail = GeneralUtil.normalizeEmail(email);
      if (normalizedEmail.isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Emails must not be blank");
      }
      normalizedEmails.add(normalizedEmail);
    }

    List<String> deleted = new ArrayList<>();
    List<String> notFound = new ArrayList<>();

    for (String email : normalizedEmails) {
      User user = userRepository.findByEmail(email).orElse(null);
      if (user == null) {
        notFound.add(email);
        continue;
      }

      deleteMe(user.getId());
      deleted.add(email);
    }

    return new DeleteUsersByEmailResult(deleted, notFound);
  }

  private static String buildDeletedUsername(UUID userId) {
    String compact = userId.toString().replace("-", "");
    String suffix = compact.length() > 12 ? compact.substring(0, 12) : compact;
    return DELETED_USERNAME_PREFIX + suffix;
  }

  private static String buildDeletedEmail(UUID userId) {
    return "deleted+" + userId + "@" + DELETED_EMAIL_DOMAIN;
  }

  private static ERole parseRole(String role) {
    try {
      return ERole.valueOf(role.toUpperCase());
    } catch (IllegalArgumentException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role value: " + role, ex);
    }
  }

  private static void initializeUserSearchCollections(User user) {
    // Calling .size() forces lazy collections to load while the read transaction is still open for DTO mapping.
    // TODO: Do more tests to try to remove .size(): here.
    user.getFavoriteLanguage().size();
    user.getFavoriteRules().size();
    user.getFavoriteRole().size();
  }

  private static ERuleSystem parseRule(String rule) {
    try {
      return GeneralUtil.parseRequiredRuleSystem(rule);
    } catch (IllegalArgumentException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
    }
  }

  private static ELanguage parseLanguage(String language) {
    try {
      return GeneralUtil.parseRequiredLanguage(language);
    } catch (IllegalArgumentException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
    }
  }

  private static void ensureFavoriteLimit(String fieldName, List<?> values) {
    if (values.size() > User.MAX_FAVORITES) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          fieldName + " cannot contain more than " + User.MAX_FAVORITES + " values"
      );
    }
  }

  private static void ensureActiveUser(User user) {
    if (user.isDeleted()) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is deleted");
    }
  }

  private static void ensureActiveContact(User user) {
    if (user.isDeleted()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }
  }

  public record DeleteUsersByEmailResult(List<String> deleted, List<String> notFound) {
  }
}
