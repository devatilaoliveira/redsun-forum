package com.rpg.redsunapi.user;

import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import com.rpg.redsunapi.authentication.Provider;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.*;

@Entity
@Table(name = "users")
public class User {
  public static final int MAX_FAVORITES = 10;

  @Id
  @Column(updatable = false)
  private UUID id;

  @Column(nullable = false, unique = true, length = 25)
  private String username;

  @Column(nullable = false, unique = true, length = 254)
  private String email;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private Provider provider = Provider.EMAIL;

  @Column(length = 4000)
  private String description;

  @Column(name = "image_url", length = 500)
  private String imageURL;

  @Column(nullable = false)
  private boolean deleted = false;

  @Column(name = "deleted_at")
  private OffsetDateTime deletedAt;

  @Column(name = "terms_accepted_at")
  private OffsetDateTime termsAcceptedAt;

  @Column(name = "terms_version", length = 20)
  private String termsVersion;

  @Column(name = "privacy_acknowledged_at")
  private OffsetDateTime privacyAcknowledgedAt;

  @Column(name = "privacy_version", length = 20)
  private String privacyVersion;

  @Column(name = "last_sign_in_at")
  private OffsetDateTime lastSignInAt;

  @ElementCollection
  @Enumerated(EnumType.STRING)
  @CollectionTable(name = "user_favorite_languages", joinColumns = @JoinColumn(name = "user_id"))
  @Column(name = "favorite_language", nullable = false, length = 10)
  @OrderColumn(name = "preference_order")
  private List<ELanguage> favoriteLanguage = new ArrayList<>();

  @ElementCollection
  @Enumerated(EnumType.STRING)
  @CollectionTable(name = "user_favorite_rules", joinColumns = @JoinColumn(name = "user_id"))
  @Column(name = "favorite_rules", nullable = false, length = 20)
  @OrderColumn(name = "preference_order")
  private List<ERuleSystem> favoriteRules = new ArrayList<>();

  @ElementCollection
  @Enumerated(EnumType.STRING)
  @CollectionTable(name = "user_favorite_roles", joinColumns = @JoinColumn(name = "user_id"))
  @Column(name = "favorite_role", nullable = false, length = 10)
  @OrderColumn(name = "preference_order")
  private List<ERole> favoriteRole = new ArrayList<>();

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(name = "user_contacts", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "contact_id"))
  private Set<User> contactsList = new HashSet<>();

  public User() {
  }

  public User(
      UUID id,
      String username,
      String email,
      Provider provider,
      String description,
      String imageURL,
      Set<User> contactsList) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.provider = Objects.requireNonNull(provider, "provider");
    this.description = description;
    this.imageURL = imageURL;
    this.contactsList = contactsList != null ? contactsList : new HashSet<>();
    this.deleted = false;
    this.deletedAt = null;
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public Provider getProvider() {
    return provider;
  }

  public void setProvider(Provider provider) {
    this.provider = Objects.requireNonNull(provider, "provider");
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getImageURL() {
    return imageURL;
  }

  public void setImageURL(String imageURL) {
    this.imageURL = imageURL;
  }

  public boolean isDeleted() {
    return deleted;
  }

  public void setDeleted(boolean deleted) {
    this.deleted = deleted;
  }

  public OffsetDateTime getDeletedAt() {
    return deletedAt;
  }

  public void setDeletedAt(OffsetDateTime deletedAt) {
    this.deletedAt = deletedAt;
  }

  public OffsetDateTime getTermsAcceptedAt() {
    return termsAcceptedAt;
  }

  public void setTermsAcceptedAt(OffsetDateTime termsAcceptedAt) {
    this.termsAcceptedAt = termsAcceptedAt;
  }

  public String getTermsVersion() {
    return termsVersion;
  }

  public void setTermsVersion(String termsVersion) {
    this.termsVersion = termsVersion;
  }

  public OffsetDateTime getPrivacyAcknowledgedAt() {
    return privacyAcknowledgedAt;
  }

  public void setPrivacyAcknowledgedAt(OffsetDateTime privacyAcknowledgedAt) {
    this.privacyAcknowledgedAt = privacyAcknowledgedAt;
  }

  public String getPrivacyVersion() {
    return privacyVersion;
  }

  public void setPrivacyVersion(String privacyVersion) {
    this.privacyVersion = privacyVersion;
  }

  public OffsetDateTime getLastSignInAt() {
    return lastSignInAt;
  }

  public void setLastSignInAt(OffsetDateTime lastSignInAt) {
    this.lastSignInAt = lastSignInAt;
  }

  public List<ELanguage> getFavoriteLanguage() {
    return favoriteLanguage;
  }

  public void setFavoriteLanguage(List<ELanguage> favoriteLanguage) {
    this.favoriteLanguage = copyFavorites(favoriteLanguage, "favoriteLanguage");
  }

  public List<ERuleSystem> getFavoriteRules() {
    return favoriteRules;
  }

  public void setFavoriteRules(List<ERuleSystem> favoriteRules) {
    this.favoriteRules = copyFavorites(favoriteRules, "favoriteRules");
  }

  public List<ERole> getFavoriteRole() {
    return favoriteRole;
  }

  public void setFavoriteRole(List<ERole> favoriteRole) {
    this.favoriteRole = copyFavorites(favoriteRole, "favoriteRole");
  }

  public Set<User> getContactsList() {
    return contactsList;
  }

  public void setContactsList(Set<User> contactsList) {
    this.contactsList = contactsList != null ? contactsList : new HashSet<>();
  }

  private static <T> List<T> copyFavorites(List<T> values, String fieldName) {
    if (values == null) {
      return new ArrayList<>();
    }
    if (values.size() > MAX_FAVORITES) {
      throw new IllegalArgumentException(fieldName + " cannot contain more than " + MAX_FAVORITES + " values");
    }
    return new ArrayList<>(values);
  }

  @Override
  public boolean equals(Object object) {
    if (this == object)
      return true;
    if (object == null || getClass() != object.getClass())
      return false;
    User user = (User) object;
    return Objects.equals(id, user.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  @Override
  public String toString() {
    return "User{" +
        "id='" + id + '\'' +
        ", username='" + username + '\'' +
        ", email='" + email +
        '}';
  }
}
