import {Component, inject, Signal} from "@angular/core";
import {LocalStoreService} from "../../../services/local-store.service";
import {MeResponseDTO} from "../../../interface/dtos/user/MeResponseDTO";
import {TranslatePipe} from "@ngx-translate/core";
import {RsAvatar} from "../../shared/fragments/rsAvatar/rs.avatar";
import {RsViewHeader} from "../../shared/fragments/rsViewHeader/rs.view-header";
import {PatchNoteGroup, PatchNotesComponent} from "../../shared/ui/patch-notes/patch-notes.component";

@Component({
  selector: "rs-home",
  standalone: true,
  imports: [
    PatchNotesComponent,
    TranslatePipe,
    RsAvatar,
    RsViewHeader,
  ],
  templateUrl: "./home.view.html",
  styleUrl: "./home.view.scss"
})
export class HomeView {
  private readonly _localStoreService: LocalStoreService = inject(LocalStoreService);

  protected user: Signal<MeResponseDTO | null> = this._localStoreService.user;
  protected readonly patchNotesTitle: string = "Notas da atualização";

  // TODO: Create endpoint to retrieve patch notes.
  protected readonly patchNoteGroups: readonly PatchNoteGroup[] = [
    {
      title: "Patch 2.0",
      date: "Julho de 2026",
      summary: "Este patch melhora o jogo nas localizações, deixa os dados das postagens mais claros e ajusta pequenos pontos de acesso.",
      items: [
        {
          title: "Fichas RedSun compactas em locais",
          description: "Jogadores em histórias RedSun podem abrir uma ficha compacta no compositor de postagens do local para consulta rápida durante o jogo."
        },
        {
          title: "Compositor de postagens melhorado",
          description: "Os modos texto, dados gerais e dados RedSun ficam mais fáceis de identificar, postagens podem ser maiores e o backend agora registra o tipo da postagem."
        },
        {
          title: "Horários de postagem mais claros",
          description: "Datas de postagens agora usam rótulos relativos localizados, como há menos de 1 h, horas, dias e há mais de uma semana."
        },
        {
          title: "Acesso ao perfil pelo avatar",
          description: "Ao clicar no avatar do autor em uma postagem, o jogador agora abre o perfil do personagem daquela história."
        }
      ]
    }
  ];
}
