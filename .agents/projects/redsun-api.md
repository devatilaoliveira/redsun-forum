# RedSun API Project Layer

Use this layer for work specific to this backend.

## Product Context

RedSun API is the Spring Boot backend for a role-playing forum application. Users create and participate in tales, manage locations, write posts and letters, and maintain character sheets per tale.

## Main Domains

- `authentication`: registration, login, verification, password reset, rate limiting.
- `user`: profile, contacts, user lookup, account state.
- `tale`: campaign/tale ownership, participants, visibility, archive state.
- `location`: tale locations and recent activity.
- `post`: location posts.
- `letter`: letter flow and cleanup.
- `characterSheet`: per-participant character sheets with rule-system handlers.
- `storage`: image upload/delete flows backed by Supabase Storage.
- `supabase`: Supabase auth/admin integration.

## Local Conventions

- Archive/sleeping tales should behave as not found for normal users.
- Tale owners have broader permissions than participants.
- Tale roles are currently derived: the owner is always `DM`, and all other participants are always `PLAYER`.
- Future tale authorization is expected to become more role-oriented instead of checking only whether a user owns the tale.
- Public tales can be viewed without participant membership where existing service methods allow it.
- Image updates should clean up replaced uploads when possible and log cleanup failures without failing the main flow.
