package com.rpg.redsunapi.test;

import com.rpg.redsunapi.authentication.RegistrationService;
import com.rpg.redsunapi.user.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.jspecify.annotations.NullMarked;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/test")
@Profile({"local"})
@Validated
@NullMarked
public class TestController {

  private final RegistrationService registrationService;
  private final UserService userService;

  public TestController(RegistrationService registrationService, UserService userService) {
    this.registrationService = registrationService;
    this.userService = userService;
  }

  @GetMapping("/verificationCode")
  public ResponseEntity<String> gerVerificationCodeByEmail(@RequestParam String email) {
    return ResponseEntity.ok(registrationService.getVerificationCodeByEmail(email));
  }

  @DeleteMapping("/users")
  public ResponseEntity<UserService.DeleteUsersByEmailResult> deleteUsersByEmail(
      @RequestBody @Valid @NotEmpty List<@NotBlank String> emails) {
    return ResponseEntity.ok(userService.deleteUsersByEmails(emails));
  }
}
