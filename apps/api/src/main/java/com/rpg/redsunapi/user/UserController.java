package com.rpg.redsunapi.user;

import com.rpg.redsunapi.authentication.AuthenticatedUser;
import com.rpg.redsunapi.user.dto.AddContactByEmailRequestDTO;
import com.rpg.redsunapi.user.dto.LegalAcknowledgementRequestDto;
import com.rpg.redsunapi.user.dto.MeRequestDto;
import com.rpg.redsunapi.user.dto.MeResponseDto;
import com.rpg.redsunapi.user.dto.UserSettingsInitializationRequestDto;
import com.rpg.redsunapi.user.dto.UserSettingsRequestDto;
import com.rpg.redsunapi.user.dto.UserAsContactDTO;
import com.rpg.redsunapi.user.dto.UserAsContactProfileDTO;
import com.rpg.redsunapi.user.dto.UserSearchResultDTO;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/user")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PostMapping("/me")
  public ResponseEntity<MeResponseDto> upsertUser(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @Valid @RequestBody UserSettingsInitializationRequestDto request
  ) {
    if (principal.newlyCreated()) {
      userService.initializeUserSettings(principal.user().getId(), request);
    }
    List<UserAsContactDTO> contacts = userService.getContactsForUser(principal.user().getId());
    return ResponseEntity.ok(userService.toMeResponse(principal.user(), contacts));
  }

  @PatchMapping("/me")
  public ResponseEntity<MeResponseDto> updateMe(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @Valid @RequestBody MeRequestDto request
  ) {
    User updatedUser = userService.updateMe(principal.user().getId(), request);
    List<UserAsContactDTO> contacts = userService.getContactsForUser(updatedUser.getId());
    return ResponseEntity.ok(userService.toMeResponse(updatedUser, contacts));
  }

  @PatchMapping("/me/settings")
  public ResponseEntity<MeResponseDto> updateMySettings(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @Valid @RequestBody UserSettingsRequestDto request
  ) {
    return ResponseEntity.ok(userService.updateMySettings(principal.user().getId(), request));
  }

  @PostMapping("/me/legal-acknowledgement")
  public ResponseEntity<MeResponseDto> acknowledgeLegalDocuments(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @Valid @RequestBody LegalAcknowledgementRequestDto request
  ) {
    return ResponseEntity.ok(userService.acknowledgeCurrentLegalDocuments(principal.user().getId()));
  }

  @PostMapping( value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<MeResponseDto> uploadAvatar(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @RequestPart("file") MultipartFile file
  ) throws IOException {
    User updatedUser = userService.updateAvatar(principal.user().getId(), file);
    return ResponseEntity.ok(userService.toMeResponse(updatedUser, List.of()));
  }

  @DeleteMapping("/avatar")
  public ResponseEntity<Boolean> deleteAvatar(
    @AuthenticationPrincipal AuthenticatedUser principal
  ) {
    return ResponseEntity.ok(userService.deleteAvatar(principal.user().getId()));
  }

  @DeleteMapping("/me")
  public ResponseEntity<Boolean> deleteMe(
    @AuthenticationPrincipal AuthenticatedUser principal
  ) {
    return ResponseEntity.ok(userService.deleteMe(principal.user().getId()));
  }

  @GetMapping("/find-users")
  public ResponseEntity<Page<UserSearchResultDTO>> findUsers(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @RequestParam(name = "page", defaultValue = "0") int page,
    @RequestParam(name = "size", defaultValue = "10") int size,
    @RequestParam(name = "userName", required = false) String userName,
    @RequestParam(name = "role", required = false) String role,
    @RequestParam(name = "rule", required = false) String rule,
    @RequestParam(name = "language", required = false) String language
  ) {
    Page<UserSearchResultDTO> users = userService
      .findUsers(principal.user().getId(), page, size, userName, role, rule, language)
      .map(UserSearchResultDTO::from);
    return ResponseEntity.ok(users);
  }

  @PostMapping("/contacts")
  public ResponseEntity<UserAsContactDTO> addContactByEmail(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @Valid @RequestBody AddContactByEmailRequestDTO request
  ) {
    UserAsContactDTO addedContact = userService.addContactByEmail(principal.user().getId(), request.email());
    return ResponseEntity.ok(addedContact);
  }

  @PostMapping("/contacts/by-identifier/{identifier}")
  public ResponseEntity<UserAsContactDTO> addContactByIdentifier(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable String identifier
  ) {
    UserAsContactDTO addedContact = userService.addContactByIdentifier(principal.user().getId(), identifier);
    return ResponseEntity.ok(addedContact);
  }

  @PostMapping("/contacts/by-id/{userId}")
  public ResponseEntity<UserAsContactDTO> addContactById(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable UUID userId
  ) {
    UserAsContactDTO addedContact = userService.addContactById(principal.user().getId(), userId);
    return ResponseEntity.ok(addedContact);
  }

  @DeleteMapping("/contacts/{contactId}")
  public ResponseEntity<Boolean> removeContactById(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable UUID contactId
  ) {
    Boolean isRemoved = userService.removeContactById(principal.user().getId(), contactId);
    return ResponseEntity.ok(isRemoved);
  }

  @GetMapping("/contacts")
  public ResponseEntity<List<UserAsContactDTO>> listContacts(
    @AuthenticationPrincipal AuthenticatedUser principal
  ) {
    List<UserAsContactDTO> contacts = userService.getContactsForUser(principal.user().getId());
    return ResponseEntity.ok(contacts);
  }

  @GetMapping("/contacts/{contactId}")
  public ResponseEntity<UserAsContactProfileDTO> getContactProfile(
    @AuthenticationPrincipal AuthenticatedUser principal,
    @PathVariable UUID contactId
  ) {
    UserAsContactProfileDTO contactProfile = userService.getContactProfile(principal.user().getId(), contactId);
    return ResponseEntity.ok(contactProfile);
  }

}
