package com.rpg.redsunapi.authentication;

import com.rpg.redsunapi.email.EmailService;
import com.rpg.redsunapi.legal.LegalDocumentService;
import com.rpg.redsunapi.subscription.Subscription;
import com.rpg.redsunapi.subscription.SubscriptionRepository;
import com.rpg.redsunapi.user.User;
import com.rpg.redsunapi.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceSubscriptionTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private SubscriptionRepository subscriptionRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @Mock
  private EmailService emailService;

  @Mock
  private ResendVerificationRateLimiter rateLimiter;

  @Mock
  private LegalDocumentService legalDocumentService;

  private RegistrationService registrationService;

  @BeforeEach
  void setUp() {
    registrationService = new RegistrationService(
        userRepository,
        subscriptionRepository,
        passwordEncoder,
        emailService,
        rateLimiter,
        legalDocumentService,
        15
    );
  }

  @Test
  void registerUserCreatesSubscriptionWithNewUser() {
    when(userRepository.findByEmail("new-user@example.com")).thenReturn(Optional.empty());
    when(userRepository.nextUsername(AuthenticationConstants.USERNAME_PREFIX)).thenReturn("Aventureiro1");
    when(passwordEncoder.encode("password")).thenReturn("encoded-password");
    when(legalDocumentService.currentTermsVersion()).thenReturn("1.0");
    when(legalDocumentService.currentPrivacyVersion()).thenReturn("1.0");
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

    registrationService.registerUser("New-User@Example.com", "password", true, true);

    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
    ArgumentCaptor<Subscription> subscriptionCaptor = ArgumentCaptor.forClass(Subscription.class);
    verify(userRepository).save(userCaptor.capture());
    verify(subscriptionRepository).save(subscriptionCaptor.capture());

    assertThat(userCaptor.getValue().getEmail()).isEqualTo("new-user@example.com");
    assertThat(userCaptor.getValue().getTermsAcceptedAt()).isNotNull();
    assertThat(userCaptor.getValue().getTermsVersion()).isEqualTo("1.0");
    assertThat(userCaptor.getValue().getPrivacyAcknowledgedAt()).isNotNull();
    assertThat(userCaptor.getValue().getPrivacyVersion()).isEqualTo("1.0");
    assertThat(subscriptionCaptor.getValue().getUser()).isSameAs(userCaptor.getValue());
  }

  @Test
  void registerUserRejectsMissingLegalAcknowledgement() {
    assertThatThrownBy(() -> registrationService.registerUser("new-user@example.com", "password", true, false))
        .hasMessageContaining("Terms and privacy acknowledgement are required");

    verify(userRepository, never()).save(any(User.class));
    verify(subscriptionRepository, never()).save(any(Subscription.class));
  }
}
