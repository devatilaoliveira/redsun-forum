package com.rpg.redsunapi.user;

import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface UserRepository {

  Optional<User> findById(UUID id);

  Optional<User> findByEmail(String email);

  Optional<User> findByUsername(String username);

  Optional<User> findMyContact(UUID userId, UUID contactId);

  Page<User> searchUsers(
      UUID requesterId,
      String username,
      EFavoriteRole role,
      ERuleSystem rule,
      ELanguage language,
      Pageable pageable);

  String nextUsername(String prefix);

  User save(User user);

  Set<User> findContacts(UUID userId);

  void removeFromContactLists(UUID userId);
}
