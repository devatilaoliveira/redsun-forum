package com.rpg.redsunapi.tale;

import com.rpg.redsunapi.user.User;
import java.util.UUID;
import org.jspecify.annotations.NullMarked;
import org.jspecify.annotations.Nullable;

@NullMarked
public record TaleMembership(Tale tale, UUID requesterId) {
  public static TaleMembership of(Tale tale, User requester) {
    return new TaleMembership(tale, requester.getId());
  }

  public static TaleMembership of(Tale tale, UUID requesterId) {
    return new TaleMembership(tale, requesterId);
  }

  public boolean isOwner() {
    return tale.isOwnedBy(requesterId);
  }

  public boolean isParticipant() {
    return tale.hasParticipant(requesterId);
  }

  public boolean canViewPublicOrMemberTale() {
    return Boolean.TRUE.equals(tale.getPublic()) || isOwner() || isParticipant();
  }

  public boolean canWrite() {
    return isOwner() || isParticipant();
  }

  public boolean canModerateAuthoredContent(@Nullable UUID authorId) {
    return isOwner() || requesterId.equals(authorId);
  }

  public boolean canWriteCharacterSheet(UUID characterSheetId) {
    return isOwner() || requesterId.equals(characterSheetId);
  }

  public ETaleRole role() {
    return tale.roleFor(requesterId);
  }
}
