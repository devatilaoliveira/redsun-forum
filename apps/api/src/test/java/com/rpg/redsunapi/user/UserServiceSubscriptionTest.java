package com.rpg.redsunapi.user;

import com.rpg.redsunapi.authentication.AuthenticationConstants;
import com.rpg.redsunapi.legal.LegalDocumentService;
import com.rpg.redsunapi.storage.AvatarStorageService;
import com.rpg.redsunapi.subscription.Subscription;
import com.rpg.redsunapi.subscription.SubscriptionRepository;
import com.rpg.redsunapi.supabase.SupabaseAuthAdminClient;
import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceSubscriptionTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private SubscriptionRepository subscriptionRepository;

  @Mock
  private AvatarStorageService avatarStorageService;

  @Mock
  private SupabaseAuthAdminClient supabaseAuthAdminClient;

  @Mock
  private LegalDocumentService legalDocumentService;

  @InjectMocks
  private UserService userService;

  @Test
  void upsertUserCreatesSubscriptionWhenUserIsCreated() {
    UUID userId = UUID.randomUUID();

    when(userRepository.findById(userId)).thenReturn(Optional.empty());
    when(userRepository.nextUsername(AuthenticationConstants.USERNAME_PREFIX)).thenReturn("Aventureiro1");
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

    User createdUser = userService.upsertUser(userId, "New-User@Example.com");

    ArgumentCaptor<Subscription> subscriptionCaptor = ArgumentCaptor.forClass(Subscription.class);
    verify(subscriptionRepository).save(subscriptionCaptor.capture());

    assertThat(createdUser.getId()).isEqualTo(userId);
    assertThat(createdUser.getEmail()).isEqualTo("new-user@example.com");
    assertThat(subscriptionCaptor.getValue().getUser()).isSameAs(createdUser);
  }

  @Test
  void upsertUserDoesNotCreateSubscriptionForExistingUser() {
    UUID userId = UUID.randomUUID();
    User existingUser = new User();
    existingUser.setId(userId);
    existingUser.setEmail("existing-user@example.com");
    existingUser.setUsername("redsun1");

    when(userRepository.findById(userId)).thenReturn(Optional.of(existingUser));

    User user = userService.upsertUser(userId, "existing-user@example.com");

    assertThat(user).isSameAs(existingUser);
    verify(subscriptionRepository, never()).findByUserId(userId);
    verify(subscriptionRepository, never()).save(any(Subscription.class));
  }

  @Test
  void acknowledgeCurrentLegalDocumentsUpdatesUserAndReturnsCurrentLegalState() {
    UUID userId = UUID.randomUUID();
    User user = new User();
    user.setId(userId);
    user.setEmail("google-user@example.com");
    user.setUsername("redsun1");

    Subscription subscription = new Subscription(user);

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(userRepository.findContacts(userId)).thenReturn(Set.of());
    when(subscriptionRepository.findByUserId(userId)).thenReturn(Optional.of(subscription));
    when(legalDocumentService.currentTermsVersion()).thenReturn("1.0");
    when(legalDocumentService.currentPrivacyVersion()).thenReturn("1.0");

    var response = userService.acknowledgeCurrentLegalDocuments(userId);

    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
    verify(userRepository).save(userCaptor.capture());

    assertThat(userCaptor.getValue().getTermsAcceptedAt()).isNotNull();
    assertThat(userCaptor.getValue().getTermsVersion()).isEqualTo("1.0");
    assertThat(userCaptor.getValue().getPrivacyAcknowledgedAt()).isNotNull();
    assertThat(userCaptor.getValue().getPrivacyVersion()).isEqualTo("1.0");
    assertThat(response.legalAcknowledgement().current()).isTrue();
  }

  @Test
  void toMeResponseTreatsMissingLegalAcknowledgementAsNotCurrent() {
    UUID userId = UUID.randomUUID();
    User user = new User();
    user.setId(userId);
    user.setEmail("google-user@example.com");
    user.setUsername("redsun1");

    when(subscriptionRepository.findByUserId(userId)).thenReturn(Optional.of(new Subscription(user)));
    when(legalDocumentService.currentTermsVersion()).thenReturn("1.0");
    when(legalDocumentService.currentPrivacyVersion()).thenReturn("1.0");

    var response = userService.toMeResponse(user, List.of());

    assertThat(response.legalAcknowledgement().termsAccepted()).isFalse();
    assertThat(response.legalAcknowledgement().privacyAcknowledged()).isFalse();
    assertThat(response.legalAcknowledgement().current()).isFalse();
  }

  @Test
  void findUsersSearchesActiveUsersWithParsedFiltersAndRecentSignInSort() {
    UUID requesterId = UUID.randomUUID();
    User requester = new User();
    requester.setId(requesterId);
    requester.setEmail("requester@example.com");
    requester.setUsername("redsun1");

    when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));
    when(userRepository.searchUsers(
        eq(requesterId),
        eq("sun"),
        eq(ERole.DM),
        eq(ERuleSystem.DND_5E),
        eq(ELanguage.EN),
        any(Pageable.class)))
        .thenReturn(new PageImpl<>(List.of()));

    userService.findUsers(requesterId, -1, 999, " sun ", "dm", "dnd_5e", "en");

    ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
    verify(userRepository).searchUsers(
        eq(requesterId),
        eq("sun"),
        eq(ERole.DM),
        eq(ERuleSystem.DND_5E),
        eq(ELanguage.EN),
        pageableCaptor.capture());

    Pageable pageable = pageableCaptor.getValue();
    assertThat(pageable.getPageNumber()).isZero();
    assertThat(pageable.getPageSize()).isEqualTo(10);
    assertThat(pageable.getSort().getOrderFor("lastSignInAt").getDirection().isDescending()).isTrue();
    assertThat(pageable.getSort().getOrderFor("username").getDirection().isAscending()).isTrue();
  }

  @Test
  void findUsersRejectsInvalidRole() {
    UUID requesterId = UUID.randomUUID();
    User requester = new User();
    requester.setId(requesterId);
    requester.setEmail("requester@example.com");
    requester.setUsername("redsun1");

    when(userRepository.findById(requesterId)).thenReturn(Optional.of(requester));

    assertThatThrownBy(() -> userService.findUsers(requesterId, 0, 10, null, "admin", null, null))
        .isInstanceOf(ResponseStatusException.class)
        .hasMessageContaining("Invalid role value");
  }
}
