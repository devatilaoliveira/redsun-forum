package com.rpg.redsunapi.user.persistence;

import com.rpg.redsunapi.user.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface JpaUserSettingsRepository extends JpaRepository<UserSettings, UUID> {
}
