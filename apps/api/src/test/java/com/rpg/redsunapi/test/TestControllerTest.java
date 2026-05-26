package com.rpg.redsunapi.test;

import com.rpg.redsunapi.user.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class TestControllerTest {

  private UserService userService;
  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    userService = mock(UserService.class);

    LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
    validator.afterPropertiesSet();

    mockMvc = standaloneSetup(new TestController(userService))
        .setValidator(validator)
        .build();
  }

  @Test
  void deleteUsersByEmailRejectsMissingBody() throws Exception {
    mockMvc.perform(delete("/test/users"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void deleteUsersByEmailRejectsNullBody() throws Exception {
    mockMvc.perform(delete("/test/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content("null"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void deleteUsersByEmailPassesValidatedEmailsToService() throws Exception {
    List<String> emails = List.of("user@example.com");
    when(userService.deleteUsersByEmails(eq(emails)))
        .thenReturn(new UserService.DeleteUsersByEmailResult(emails, List.of()));

    mockMvc.perform(delete("/test/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content("[\"user@example.com\"]"))
        .andExpect(status().isOk());

    verify(userService).deleteUsersByEmails(emails);
  }
}
