package com.rpg.redsunapi.user.dto;

import com.rpg.redsunapi.authentication.Provider;
import com.rpg.redsunapi.subscription.Subscription;
import com.rpg.redsunapi.subscription.dto.SubscriptionDTO;
import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import com.rpg.redsunapi.user.ERole;
import com.rpg.redsunapi.user.User;

import java.util.List;
import java.util.Objects;

public record MeResponseDto(
  String id,
  String username,
  String email,
  Provider provider,
  String imageURL,
  String description,
  List<ELanguage> favoriteLanguage,
  List<ERuleSystem> favoriteRules,
  List<ERole> favoriteRole,
  SubscriptionDTO subscription,
  List<UserAsContactDTO> contacts,
  LegalAcknowledgementDto legalAcknowledgement
) {

  public static MeResponseDto from(
      User user,
      List<UserAsContactDTO> contacts,
      Subscription subscription,
      String requiredTermsVersion,
      String requiredPrivacyVersion) {
    Objects.requireNonNull(user, "user");
    List<UserAsContactDTO> usersAsContacts = contacts == null ? List.of() : contacts;
    boolean isDeleted = user.isDeleted();

    return new MeResponseDto(
      user.getId().toString(),
      isDeleted ? null : user.getUsername(),
      isDeleted ? null : user.getEmail(),
      Objects.requireNonNull(user.getProvider(), "provider"),
      isDeleted ? null : user.getImageURL(),
      isDeleted ? null : user.getDescription(),
      isDeleted ? null : List.copyOf(user.getFavoriteLanguage()),
      isDeleted ? null : List.copyOf(user.getFavoriteRules()),
      isDeleted ? null : List.copyOf(user.getFavoriteRole()),
      isDeleted ? null : SubscriptionDTO.from(Objects.requireNonNull(subscription, "subscription")),
      usersAsContacts,
      isDeleted ? null : LegalAcknowledgementDto.from(user, requiredTermsVersion, requiredPrivacyVersion)
    );
  }
}
