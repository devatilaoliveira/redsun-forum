package com.rpg.redsunapi.patchNote;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PatchNoteControllerTest {

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    PatchNoteService service = mock(PatchNoteService.class);
    mockMvc = MockMvcBuilders.standaloneSetup(new PatchNoteController(service)).build();
  }

  @Test
  void rejectsAnInvalidLanguage() throws Exception {
    mockMvc.perform(get("/patch-notes").param("language", "FR"))
      .andExpect(status().isBadRequest());
  }
}
