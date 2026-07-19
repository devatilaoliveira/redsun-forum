package com.rpg.redsunapi.user;

import com.rpg.redsunapi.tale.Tale;
import com.rpg.redsunapi.tale.enums.ELanguage;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import org.jspecify.annotations.Nullable;

import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "user_settings")
public class UserSettings {

  @Id
  @Column(name = "user_id", updatable = false)
  private UUID userId;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @MapsId
  @JoinColumn(name = "user_id")
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(name = "app_language", nullable = false, length = 20)
  private ELanguage appLanguage = ELanguage.PT;

  @Enumerated(EnumType.STRING)
  @Column(name = "app_theme", nullable = false, length = 20)
  private EThemeApplication appTheme = EThemeApplication.DARK;

  @Column(name = "redirect_to_favorite", nullable = false)
  private boolean redirectToFavorite;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "favorite_tale_id")
  private @Nullable Tale favoriteTale;

  public UserSettings() {
  }

  public UserSettings(User user) {
    this(user, ELanguage.PT, EThemeApplication.DARK);
  }

  public UserSettings(User user, ELanguage appLanguage, EThemeApplication appTheme) {
    this.user = Objects.requireNonNull(user, "user");
    this.userId = user.getId();
    this.appLanguage = appLanguage;
    this.appTheme = appTheme;
  }

  public UUID getUserId() {
    return userId;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = Objects.requireNonNull(user, "user");
    this.userId = user.getId();
  }

  public ELanguage getAppLanguage() {
    return appLanguage;
  }

  public void setAppLanguage(ELanguage appLanguage) {
    this.appLanguage = appLanguage;
  }

  public EThemeApplication getAppTheme() {
    return appTheme;
  }

  public void setAppTheme(EThemeApplication appTheme) {
    this.appTheme = appTheme;
  }

  public boolean isRedirectToFavorite() {
    return redirectToFavorite;
  }

  public void setRedirectToFavorite(boolean redirectToFavorite) {
    this.redirectToFavorite = redirectToFavorite;
  }

  public @Nullable Tale getFavoriteTale() {
    return favoriteTale;
  }

  public void setFavoriteTale(@Nullable Tale favoriteTale) {
    this.favoriteTale = favoriteTale;
  }
}
