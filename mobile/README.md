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
    ├── Home/                 # aba Dashboard: saudação e destaques de evolução
    ├── Trainings/            # lista, detalhe (mostra os subtreinos), criar, editar, remover treino
    ├── Subtrainings/         # até 3 por treino: detalhe (exercícios), criar, editar, remover
    ├── Exercises/            # todos os exercícios, criar, detalhe (carga, séries, gráfico), remover
    ├── Weights/              # aba Pesos: ranking de evolução de carga
    └── Account/              # dados do usuário e plano da conta
```

## Sessão

O login grava o cookie httpOnly `jwt` (definido pelo backend). O networking nativo do Android e do iOS guarda esse cookie e o reenvia sozinho, então o app nunca manipula o token. Ao abrir, o app chama `GET /conta` para restaurar a sessão; qualquer resposta 401 volta para o login.

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
