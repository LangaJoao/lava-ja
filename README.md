# Lava Já

Aplicação de lavagem de viaturas e fidelização em React Native, Expo SDK 57 e TypeScript. Inclui os fluxos móveis de **Cliente, Car Wash e Prestador de Serviços**, reproduzidos a partir das referências do FlutterFlow Designer.

## Organização do código

```text
lava-ja/
├── assets/                         # Ícones e imagens
├── src/
│   ├── app/                        # Rotas e layout do Expo Router
│   │   ├── _layout.tsx             # Navegação, fontes e providers
│   │   ├── mobile/                 # Barras inferiores dos três perfis
│   │   ├── index.js                # Splash → escolha de perfil
│   │   ├── client.js               # Compatibilidade com a rota anterior
│   │   └── admin.js                # Rota da administração web
│   ├── features/
│   │   ├── mobile/                 # Ecrãs, componentes, tema, dados e estado tipados
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

As rotas em `src/app` encaminham para os ecrãs em `src/features/mobile`. Os componentes anteriores foram preservados. A administração do sistema usa `SystemAdmin.web.tsx`. O contexto de sessão permite percorrer a demonstração por perfil e os dados são guardados localmente com AsyncStorage.

## Aplicação no telemóvel

Executar `npm.cmd start`, abrir o QR Code no Expo Go compatível com SDK 57 e escolher um perfil. É possível percorrer o registo ou escolher **Já tenho uma conta? Entrar → Explorar como …** sem credenciais.

Para iniciar explicitamente o Expo Go pela mesma rede Wi-Fi, com cache limpo e porta fixa, usar `npm.cmd run start:mobile`. O comando usa LAN na porta 8081 e não cria um túnel. No iPhone, abrir o endereço actual mostrado pelo servidor; projectos antigos no histórico podem apontar para outra porta. O computador e o Expo Go do iPhone devem usar a mesma conta Expo, e o Expo Go precisa de acesso à rede local nas definições do iOS.

Em **Perfil → Explorar perfis** é possível alternar entre Cliente, Car Wash e Prestador. Uma reserva criada pelo Cliente aparece no Car Wash: aceitar → iniciar atendimento → marcar a checklist → concluir. A conclusão actualiza os pontos do Cliente. O Prestador tem pedidos e trabalhos próprios, disponibilidade, agenda e ganhos.

O [inventário e roteiro de verificação](docs/mobile-design.md) lista todas as referências, rotas, decisões visuais e limites conhecidos.

## Administração web

Executar `npm.cmd run web -- --port 8085` e abrir `http://localhost:8085` no navegador. Na escolha de perfil, seleccionar **Administração web**. A aplicação móvel também pode ser pré-visualizada no navegador.

O painel inclui visão geral da plataforma, Car Wash e Prestadores registados, utilizadores por perfil, relatórios financeiros individuais e globais (dia, semana, mês ou intervalo personalizado), exportação CSV, avaliações, pedidos e histórico de liquidações semanais simuladas. Os períodos usam o fuso Africa/Maputo.

O painel e os perfis móveis pré-visualizados no mesmo navegador usam os mesmos dados. As alterações são sincronizadas entre separadores da mesma origem. No Expo Go, os dados ficam no telemóvel: não existe backend nem sincronização entre dispositivos ou origens diferentes (por exemplo, portas 8081 e 8085). Os dados mantêm-se ao sair/reabrir; a sessão começa novamente pela escolha de perfil.

## Registo, avaliações e monetização

- Registo dos três perfis: preencher um número moçambicano válido → OTP de demonstração **123456** → completar os detalhes do perfil. O código expira em 3 minutos, tem até 5 tentativas e permite reenvio após 30 segundos. Não é enviado SMS.
- Garagem: **Que carro pretendes lavar?**, marca, matrícula e cor; o campo Modelo foi removido. Os dados anteriores são preservados.
- Avaliação: o parceiro conclui a checklist → Cliente abre a reserva → **Concluído — avaliar serviço** → 1 a 5 estrelas e comentário opcional. Só é permitida uma avaliação por serviço concluído e confirmado pelo cliente.
- Pilar 1: comissão de **10%**, com reconhecimento financeiro ao concluir o serviço e liquidação semanal simulada de semanas encerradas por referência bancária. Pagamentos no local geram comissão a cobrar ao parceiro, sem duplicar o pagamento ao Car Wash.
- Pilar 2: comissão de **5%** por vaga preenchida/aceite na rampa de bairro. O Cliente pode reservar um Prestador pelo início do app.
- Cada pedido guarda a taxa aplicada. Os relatórios separam volume bruto, comissão da plataforma e líquido do parceiro; rejeições e cancelamentos são excluídos. Os valores não representam lucro após despesas operacionais.

O [roteiro destas funcionalidades](docs/platform-features.md) detalha os testes manuais e os limites da demonstração.

Pagamentos, autenticação, recuperação de acesso, chamadas, mapas com trajectos reais e IA são demonstrações identificadas na interface. Não há cobrança, envio de mensagens, criação de contas no servidor ou ligação a serviços bancários.

## Verificação

```sh
npm run lint
npm run typecheck
npm test
npx expo export --platform web --platform android --platform ios --output-dir .expo/build-check
```

No PowerShell, usar `npm.cmd`/`npx.cmd` se a política de execução bloquear os wrappers `.ps1`. Os testes cobrem transições de reservas, conclusão com checklist, crédito único de pontos e resgates sem saldo negativo. A revisão visual final deve ser feita em Expo Go no dispositivo; o empacotamento não verifica o aspecto dos ecrãs.
