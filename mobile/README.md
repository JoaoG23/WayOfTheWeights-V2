# WayOfTheWeights — Mobile

App (Expo / React Native) do Way Of The Weights: treinos, exercícios e evolução de carga.

**Stack:** Expo 57 · React Navigation (abas + stack) · TanStack Query · axios · react-hook-form · react-native-svg · react-native-toast-message

## Estrutura

```
src/
├── App.tsx / Routes.tsx      # providers, abas (Treinos, Exercícios, Pesos) e stack
├── contexts/AuthContext.tsx  # sessão: login, logout, restauração e 401 → login
├── services/api.ts           # axios com withCredentials (cookie de sessão)
├── components/               # Button, Input, Card, AppHeader, GraficoEvolucao...
├── helpers/                  # formatação de carga/data, mensagens de erro da API
├── theme/cores.ts            # paleta do app
└── screens/
    ├── Auth/                 # Login, SignUp (cria conta)
    ├── Home/                 # saudação e destaques de evolução
    ├── Trainings/            # lista, detalhe (mostra os subtreinos), criar, editar, remover treino
    ├── Subtrainings/         # até 3 por treino: detalhe (exercícios), criar, editar, remover
    ├── Exercises/            # todos os exercícios, criar, detalhe (carga, séries, gráfico), remover
    ├── Weights/              # aba Pesos: ranking de evolução de carga
    └── Account/              # dados do usuário e plano da conta
```

## Sessão

O login grava o cookie httpOnly `jwt` (definido pelo backend). O networking nativo do Android e do iOS guarda esse cookie e o reenvia sozinho, então o app nunca manipula o token. Ao abrir, o app chama `GET /conta` para restaurar a sessão; qualquer resposta 401 volta para o login.

## Como rodar

```bash
cp .env.example .env    # ajuste EXPO_PUBLIC_API_URL para o IP da sua máquina
npm install
npm run start
```

No celular, use o IP da máquina na rede local (não `localhost`), com o backend rodando na mesma rede.
