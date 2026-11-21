# WayOfTheWeights — Mobile

App (Expo / React Native) do Way Of The Weights: treinos, exercícios e evolução de carga.

**Stack:** Expo 58 · React Navigation (abas + stack) · TanStack Query · axios · react-hook-form · react-native-svg · react-native-toast-message · expo-local-authentication · expo-secure-store

## Estrutura

```
src/
├── App.tsx / Routes.tsx      # providers, abas (Dashboard, Treinos, Exercícios, Pesos) e stack
├── contexts/AuthContext.tsx  # sessão: login, logout, restauração e 401 → login
├── services/api.ts           # axios com withCredentials (cookie de sessão)
├── services/biometria.ts     # login por biometria: credenciais no cofre seguro do aparelho
├── components/               # Button, Input, Card, AppHeader, DecoracaoFundo, TelaComTeclado...
├── helpers/                  # formatação de carga/data, mensagens de erro da API
├── theme/cores.ts            # paleta do app
└── screens/
    ├── Auth/                 # Login (com biometria), SignUp, recuperação de senha por código
    ├── Home/                 # aba Dashboard: calendário semanal de treinos concluídos e destaques de evolução
    ├── Conclusoes/           # api do checklist de conclusão e do histórico de treinos
    ├── Trainings/            # lista, detalhe (mostra os subtreinos), criar, editar, remover treino
    ├── Subtrainings/         # até 3 por treino: detalhe (exercícios), criar, editar, remover, importar por imagens
    ├── Exercises/            # todos os exercícios, criar, detalhe (carga, séries, gráfico), remover
    ├── Weights/              # aba Pesos: ranking de evolução de carga
    └── Account/              # dados do usuário (editar nome, foto de perfil) e plano da conta
```

## Sessão

O login grava o cookie httpOnly `jwt` (definido pelo backend). O networking nativo do Android e do iOS guarda esse cookie e o reenvia sozinho, então o app nunca manipula o token. Ao abrir, o app chama `GET /conta` para restaurar a sessão; qualquer resposta 401 volta para o login.

## Checklist de treino e calendário semanal

No detalhe do subtreino, o ícone verde de checklist inicia o treino: cada toque num exercício o marca ou desmarca. Quando **todos** os exercícios estão marcados, o app registra a conclusão (`POST /treinos/:id/subtreinos/:id/conclusoes`), avisa "Treino concluído!" e sai do modo checklist. Também dá para finalizar **parcialmente**: com ao menos um exercício marcado aparece o botão "Finalizar com X de Y", e só os marcados entram no histórico (aparece como "Parcial" no calendário). Se o app for fechado antes de marcar todos, a marcação parcial é perdida (nada é salvo até concluir).

O dashboard (aba Dashboard) mostra os **treinos da semana** em formato de calendário: cada dia (segunda a domingo) lista os treinos concluídos, com o nome do treino, o subtreino e a data/hora. As setas navegam entre semanas (até a semana atual); os dados vêm de `GET /conclusoes`.

## Foto de perfil

Na tela Conta, tocar no avatar abre as opções: escolher da galeria, tirar foto ou remover. A imagem é recortada em quadrado e enviada ao backend (`PUT /conta/foto`, até 2 MB), que a guarda em disco. O app exibe a foto com `<Image>` apontando para `GET /conta/foto?v=<fotoVersao>`; a sessão por cookie é enviada pela rede nativa, como nas demais chamadas.

## Importar subtreino por imagens (OCR)

No detalhe do treino (ícone de câmera, enquanto houver vaga) ou do subtreino (atualizar), escolha fotos da ficha de treino pela galeria ou câmera (até 10).

1. O app envia as imagens ao backend (`POST /treinos/:id/subtreinos/ocr`), que usa o Gemini e devolve o JSON padronizado do subtreino.
2. Você **confere e corrige** o que foi lido: nome, carga e repetições de cada exercício, e pode remover os que vieram errados.
3. Ao salvar (`PUT /treinos/:id/subtreinos/:id/importar`), o backend cria o subtreino ou atualiza o existente. Exercícios com o mesmo nome são atualizados; os que não estão na ficha ficam como estão.

Requer `GEMINI_API_KEY` configurada no backend. `expo-image-picker` é um módulo nativo: gere o dev client de novo.

## Login por biometria

Depois de um login com email e senha, o app pergunta se você quer entrar com a digital, o rosto ou o desbloqueio do celular (PIN/padrão) nos próximos acessos.

- **Armazenamento:** se aceitar, email e senha ficam no Keychain (iOS) / Keystore (Android) via `expo-secure-store`, nunca em AsyncStorage. A sessão do servidor dura 24 h e não há refresh token, por isso as credenciais precisam ser guardadas.
- **Uso:** a tela de login pede a biometria ao abrir; o botão "Entrar com biometria" repete o pedido, e cancelar leva ao login normal.
- **Credenciais inválidas:** se o login com as credenciais guardadas falhar (ex.: senha redefinida), a biometria é desativada e o app avisa.
- **Desativar:** botão "Desativar login por biometria" na tela Conta. Sair da conta **não** desativa a biometria.
- **Só ativa no login com senha:** é o único momento em que o app tem a senha em mãos.

Os módulos são nativos: é preciso gerar o dev client de novo (`npx expo run:android` ou `run:ios`); o Expo Go não suporta.

## Como rodar

```bash
cp .env.example .env    # ajuste EXPO_PUBLIC_API_URL para o IP da sua máquina
npm install
npx expo run:android   # ou run:ios — gera o dev client (módulos nativos)
npm run start
```

No celular, use o IP da máquina na rede local (não `localhost`), com o backend rodando na mesma rede.
