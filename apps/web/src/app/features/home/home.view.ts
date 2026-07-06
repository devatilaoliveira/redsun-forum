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
      title: "Patch 2.1",
      date: "2026-07-06",
      summary: "Este patch melhora a navegação entre personagens, ajusta a apresentação dos locais e deixa os deploys do frontend mais estáveis.",
      items: [
        {
          title: "Autenticação mais estável",
          description: "O fluxo de autenticação do frontend foi simplificado para usar redirecionamento direto, tratar melhor erros de callback e limpar a sessão quando o login não é concluído corretamente."
        },
        {
          title: "Modos de postagem preservam melhor o conteúdo",
          description: "Ao alternar entre texto, dados e ficha de personagem em um local, o compositor agora mantém ou limpa os campos de forma mais previsível, evitando perda desnecessária do que estava sendo escrito."
        },
        {
          title: "Participantes levam ao perfil do personagem",
          description: "A lista de participantes no gerenciamento da história agora abre o perfil do personagem, seguindo o mesmo comportamento do carrossel da história."
        },
        {
          title: "Cartão de local mais compacto",
          description: "O avatar do autor agora aparece na mesma linha do nome, liberando espaço em telas pequenas e mantendo o layout consistente em todos os tamanhos."
        },
        {
          title: "Acesso ao personagem pelo local",
          description: "Ao clicar no avatar do autor em um local, o jogador agora abre a ficha do personagem daquela história."
        },
        {
          title: "Deploys mais seguros",
          description: "O frontend ganhou regras de cache para Workers Static Assets e recupera automaticamente uma vez quando uma aba antiga tenta carregar arquivos de uma versão anterior."
        },
        {
          title: "Melhoria de texto mais fiel ao narrador",
          description: "A melhoria automática de postagens agora preserva melhor se o texto foi narrado em primeira pessoa pelo jogador ou em terceira pessoa pelo narrador."
        }
      ]
    },
    {
      title: "Patch 2.0",
      date: "2026-07-05",
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
