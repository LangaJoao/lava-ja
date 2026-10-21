# Lava Já

Protótipo de lavagem de viaturas e fidelização em Expo.

## Organização do código

```text
lava-ja/
├── assets/                         # Ícones e imagens
├── src/
│   ├── app/                        # Rotas e layout do Expo Router
│   │   ├── _layout.js              # Navegação e acesso por perfil/plataforma
│   │   ├── index.js                # Rota de login
│   │   ├── client.js               # Rota do cliente móvel
│   │   └── admin.js                # Rota da administração web
│   ├── features/
│   │   ├── auth/
│   │   │   ├── context/            # Sessão de demonstração
│   │   │   └── screens/            # Tela de login
│   │   ├── client/
│   │   │   ├── components/         # Conteúdo da área de cliente
│   │   │   └── screens/            # Tela do cliente móvel
│   │   └── admin/
│   │       ├── data/               # Pedidos de demonstração
│   │       ├── screens/            # Painel web e alternativa nativa
│   │       └── styles/             # CSS exclusivo da administração
│   └── shared/
│       ├── components/             # Interface reutilizável
│       ├── data/                   # Catálogo comum de serviços
│       └── theme/                  # Cores partilhadas
├── app.json                        # Configuração Expo
├── index.js                        # Entrada do Expo Router
└── package.json                    # Dependências e comandos
```

As rotas em `src/app` apenas encaminham para as telas das respetivas áreas. O código específico de uma área fica em `features`; só o que é reutilizado vai para `shared`. O ficheiro `AdminDashboard.web.js` é carregado no navegador; a alternativa `AdminDashboard.js` encaminha acessos nativos para o login. As duas plataformas usam o mesmo projeto Expo e o mesmo catálogo de serviços.

## Cliente no telemóvel

Executar `npm.cmd start`, abrir o QR Code no Expo Go e selecionar **Entrar como cliente**.

## Administração web

Executar `npm.cmd run web -- --port 8085` e abrir `http://localhost:8085` no navegador. Selecionar **Entrar na administração web**. Para usar outro dispositivo na mesma rede, substituir `localhost` pelo IP do computador.

O painel permite pesquisar e filtrar pedidos, concluir lavagens, consultar serviços e acompanhar pontos. A conclusão atualiza os indicadores e a página de fidelização. **Repor demonstração** restaura os pedidos iniciais; **Sair da conta** regressa ao login.

Não exige credenciais. Os dados são exemplos em memória, reiniciam ao sair ou recarregar e não são sincronizados com o app. Não processa reservas nem pagamentos reais.

## Verificação

`npx.cmd expo export --platform web --platform ios --output-dir .expo/build-check`

O projeto ainda não tem ESLint nem TypeScript configurados.
