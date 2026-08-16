package com.rpg.redsunapi.integration.patchNotes;

import com.rpg.redsunapi.patchNote.PatchNoteLanguage;
import com.rpg.redsunapi.patchNote.PatchNoteService;
import com.rpg.redsunapi.patchNote.dto.PatchNoteResponseDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("local")
@Execution(ExecutionMode.CONCURRENT)
class PatchNotesServicesIT {
  private final PatchNoteService patchNoteService;

  @Autowired
  public PatchNotesServicesIT(PatchNoteService patchNoteService) {
    this.patchNoteService = patchNoteService;
  }

  @Test
  void shouldReturnPortuguesePatchNotesFromDataBase() {
    Page<PatchNoteResponseDTO> result = patchNoteService.findPatchNotes(0, PatchNoteLanguage.PT);
    assertThat(result).isNotNull();
    assertThat(result.getSize()).isEqualTo(1);
    assertThat(result.getContent()).hasSize(1);

    PatchNoteResponseDTO patchNote = result.getContent().getFirst();

    assertThat(patchNote.title()).isNotBlank();
    assertThat(patchNote.summary()).isNotBlank();
    assertThat(patchNote.summary()).isEqualTo("Este patch melhora a navegação entre personagens, ajusta a apresentação dos locais e deixa os deploys do frontend mais estáveis.");
    assertThat(patchNote.releaseDate()).isNotNull();
    assertThat(patchNote.items().size()).isGreaterThan(0);
  }

  @Test
  void shouldReturnEnglishPatchNotesFromDataBase() {
    Page<PatchNoteResponseDTO> result = patchNoteService.findPatchNotes(0, PatchNoteLanguage.EN);
    assertThat(result).isNotNull();
    assertThat(result.getSize()).isEqualTo(1);
    assertThat(result.getContent()).hasSize(1);

    PatchNoteResponseDTO patchNote = result.getContent().getFirst();

    assertThat(patchNote.title()).isNotBlank();
    assertThat(patchNote.summary()).isNotBlank();
    assertThat(patchNote.summary()).isEqualTo("This patch improves character navigation, refines location presentation, and makes frontend deployments more reliable.");
    assertThat(patchNote.releaseDate()).isNotNull();
    assertThat(patchNote.items().size()).isGreaterThan(0);
  }

  @Test
  void shouldReturnGermanPatchNotesFromDataBase() {
    Page<PatchNoteResponseDTO> result = patchNoteService.findPatchNotes(0, PatchNoteLanguage.DE);
    assertThat(result).isNotNull();
    assertThat(result.getSize()).isEqualTo(1);
    assertThat(result.getContent()).hasSize(1);

    PatchNoteResponseDTO patchNote = result.getContent().getFirst();

    assertThat(patchNote.title()).isNotBlank();
    assertThat(patchNote.summary()).isNotBlank();
    assertThat(patchNote.summary()).isEqualTo("Dieser Patch verbessert die Navigation zwischen Charakteren, die Darstellung von Orten und die Zuverlässigkeit von Frontend-Deployments.");
    assertThat(patchNote.releaseDate()).isNotNull();
    assertThat(patchNote.items().size()).isGreaterThan(0);
  }
}
