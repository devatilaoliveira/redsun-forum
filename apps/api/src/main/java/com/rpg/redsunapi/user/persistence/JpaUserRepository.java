package com.rpg.redsunapi.user.persistence;

import com.rpg.redsunapi.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface JpaUserRepository extends JpaRepository<User, UUID> {

  Optional<User> findByEmailIgnoreCase(String email);

  Optional<User> findByUsernameIgnoreCase(String username);

  Optional<User> findByVerificationToken(String verificationToken);

  @Query(value = "select private.next_username(?1)", nativeQuery = true)
  String nextUsername(String prefix);

  @Query("""
    select c from User u
    join u.contactsList c
    where u.id = :userId
      and c.deleted = false
  """)
  Set<User> findContacts(UUID userId);

  @Query("""
    select c from User u
    join u.contactsList c
    where u.id = :userId
      and c.id = :contactId
      and c.deleted = false
  """)
  Optional<User> findContact(UUID userId, UUID contactId);

  @Modifying
  @Query(value = "delete from user_contacts where contact_id = :userId", nativeQuery = true)
  void deleteContactsReferencing(UUID userId);
}
