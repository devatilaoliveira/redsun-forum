package com.rpg.redsunapi.user.persistence;

import com.rpg.redsunapi.tale.enums.ELanguage;
import com.rpg.redsunapi.tale.enums.ERuleSystem;
import com.rpg.redsunapi.user.EFavoriteRole;
import com.rpg.redsunapi.user.User;
import com.rpg.redsunapi.user.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public class UserRepositoryAdapter implements UserRepository {

  private final JpaUserRepository jpaUserRepository;
  private final EntityManager entityManager;

  public UserRepositoryAdapter(JpaUserRepository jpaUserRepository, EntityManager entityManager) {
    this.jpaUserRepository = jpaUserRepository;
    this.entityManager = entityManager;
  }

  @Override
  public Optional<User> findById(UUID id) {
    return jpaUserRepository.findById(id);
  }

  @Override
  public Optional<User> findByEmail(String email) {
    return jpaUserRepository.findByEmailIgnoreCase(email);
  }

  @Override
  public Optional<User> findByUsername(String username) {
    return jpaUserRepository.findByUsernameIgnoreCase(username);
  }

  @Override
  public Optional<User> findMyContact(UUID userId, UUID contactId) {
    return jpaUserRepository.findContact(userId, contactId);
  }

  @Override
  public Page<User> searchUsers(
      UUID requesterId,
      String username,
      EFavoriteRole role,
      ERuleSystem rule,
      ELanguage language,
      Pageable pageable) {
    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

    CriteriaQuery<User> query = criteriaBuilder.createQuery(User.class);
    Root<User> root = query.from(User.class);
    query.select(root)
        .where(buildSearchPredicates(criteriaBuilder, root, requesterId, username, role, rule, language))
        .orderBy(
            criteriaBuilder.asc(criteriaBuilder.selectCase()
                .when(criteriaBuilder.isNull(root.get("lastSignInAt")), 1)
                .otherwise(0)),
            criteriaBuilder.desc(root.<OffsetDateTime>get("lastSignInAt")),
            criteriaBuilder.asc(root.get("username"))
        );

    TypedQuery<User> typedQuery = entityManager.createQuery(query);
    typedQuery.setFirstResult(Math.toIntExact(pageable.getOffset()));
    typedQuery.setMaxResults(pageable.getPageSize());

    List<User> users = typedQuery.getResultList();
    long total = countSearchUsers(criteriaBuilder, requesterId, username, role, rule, language);

    return new PageImpl<>(users, pageable, total);
  }

  private long countSearchUsers(
      CriteriaBuilder criteriaBuilder,
      UUID requesterId,
      String username,
      EFavoriteRole role,
      ERuleSystem rule,
      ELanguage language) {
    CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
    Root<User> root = countQuery.from(User.class);
    countQuery.select(criteriaBuilder.countDistinct(root))
        .where(buildSearchPredicates(criteriaBuilder, root, requesterId, username, role, rule, language));

    return entityManager.createQuery(countQuery).getSingleResult();
  }

  private Predicate[] buildSearchPredicates(
      CriteriaBuilder criteriaBuilder,
      Root<User> root,
      UUID requesterId,
      String username,
      EFavoriteRole role,
      ERuleSystem rule,
      ELanguage language) {
    List<Predicate> predicates = new ArrayList<>();
    predicates.add(criteriaBuilder.isFalse(root.get("deleted")));
    predicates.add(criteriaBuilder.notEqual(root.get("id"), requesterId));

    if (username != null) {
      predicates.add(criteriaBuilder.like(
          criteriaBuilder.lower(root.get("username")),
          "%" + escapeLikePattern(username.toLowerCase()) + "%",
          '\\'
      ));
    }

    if (role != null) {
      predicates.add(criteriaBuilder.isMember(role, root.get("favoriteRole")));
    }

    if (rule != null) {
      predicates.add(criteriaBuilder.isMember(rule, root.get("favoriteRules")));
    }

    if (language != null) {
      predicates.add(criteriaBuilder.isMember(language, root.get("favoriteLanguage")));
    }

    return predicates.toArray(Predicate[]::new);
  }

  private String escapeLikePattern(String value) {
    return value
        .replace("\\", "\\\\")
        .replace("%", "\\%")
        .replace("_", "\\_");
  }

  @Override
  public String nextUsername(String prefix) {
    return jpaUserRepository.nextUsername(prefix);
  }

  @Override
  public User save(User user) {
    return jpaUserRepository.save(user);
  }

  @Override
  public Set<User> findContacts(UUID userId) {
    return jpaUserRepository.findContacts(userId);
  }

  @Override
  public void removeFromContactLists(UUID userId) {
    jpaUserRepository.deleteContactsReferencing(userId);
  }
}
