# Registos, administração e monetização — demonstração

## OTP e registo

O registo de Cliente, Car Wash e Prestador passa por `/verify-otp`. Aceitam-se números moçambicanos no formato `84 123 4567` ou `+258 84 123 4567` (prefixos móveis 82–87). O código `123456` é visível no ecrã e serve exclusivamente para demonstração. Não há conta SMS, backend, cobrança ou envio de mensagens.

O código está associado ao número e ao perfil escolhidos; expira após 3 minutos, bloqueia após 5 tentativas incorrectas e permite reenvio após 30 segundos. O registo só é incluído nos contadores da administração depois de verificar o código e concluir os detalhes. O mesmo número pode ter perfis diferentes; repetir um registo no mesmo perfil não duplica o utilizador.

As opções “Explorar como…” continuam a permitir navegar pelos dados de demonstração sem criar utilizadores fictícios a cada entrada.

## Garagem

O título passa a ser “Que carro pretendes lavar?”. O formulário recolhe marca, matrícula e cor. Modelo deixa de ser exigido ou apresentado nos cartões de veículos e reservas novos. Os modelos em dados antigos permanecem guardados para evitar perda de informação, mas não são pedidos ao utilizador.

## Avaliações

1. Reservar um Car Wash ou um Prestador como Cliente.
2. No perfil do parceiro, aceitar o pedido, iniciar e concluir a checklist.
3. No Cliente, abrir o aviso na página inicial ou a reserva no histórico.
4. Tocar em “Concluído — avaliar serviço”. Este clique confirma a conclusão pelo cliente e abre a avaliação.
5. Seleccionar 1–5 estrelas e, opcionalmente, escrever um comentário; enviar.
6. A avaliação aparece na reserva, no detalhe do Car Wash ou no painel do Prestador, e na administração web. Não é possível avaliar novamente o mesmo serviço.

## Financeiro

| Pilar     | Base                                        | Comissão | Reconhecimento                  | Liquidação                                                      |
| --------- | ------------------------------------------- | -------- | ------------------------------- | --------------------------------------------------------------- |
| Car Wash  | Valor bruto do agendamento                  | 10%      | Serviço concluído               | Semanal, por transferência bancária formal simulada             |
| Prestador | Valor da vaga preenchida na rampa de bairro | 5%       | Pedido aceite (vaga preenchida) | Sem periodicidade inventada; apenas saldo líquido demonstrativo |

Exemplo Car Wash: 600 MT bruto → 60 MT plataforma → 540 MT parceiro. Exemplo Prestador: 600 MT bruto → 30 MT plataforma → 570 MT parceiro. A comissão é deduzida da parte do parceiro, sem acrescentar uma taxa ao preço apresentado ao cliente.

Os cálculos usam cêntimos inteiros. Cada pedido guarda a sua taxa, data de criação, aceitação e conclusão; o histórico não muda de taxa quando uma regra futura for alterada. Cancelamentos e rejeições são excluídos dos relatórios.

A liquidação de Car Wash só inclui serviços concluídos em semanas anteriores à semana actual, que começa à segunda-feira em Africa/Maputo. Exige uma referência de transferência simulada e guarda os pedidos incluídos no lote; um pedido liquidado não volta a entrar noutro lote. A comissão aparece separada do líquido a liquidar. Nenhum banco é contactado.

“Pagar no Local” significa que o parceiro já recebe o valor do cliente. Por isso, esses serviços não geram uma segunda transferência ao parceiro: geram comissão a cobrar ao Car Wash. O painel distingue essa dívida dos saldos digitais por liquidar. Não foi implementado um processo bancário real de cobrança desta dívida.

## Administração web

Abrir a pré-visualização web → escolha de perfil → Administração web. Secções: Visão geral, Parceiros, Utilizadores, Financeiro, Liquidações, Avaliações e Pedidos.

Os filtros diário/semanal/mensal/personalizado e parceiro permitem consultar relatórios individuais e globais. O CSV exporta o resumo por parceiro com datas, taxa, número de operações, volume bruto, comissão e líquido. Os indicadores de utilizadores mostram totais acumulados por perfil e novos registos no período.

Os dados de exemplo incluem três Car Wash, um Prestador e dois Clientes. Novos registos concluídos são acrescentados. Utilizadores de demonstração não representam uma base real de produção.

## Persistência e validação

O painel e as áreas móveis no mesmo navegador/origem partilham o estado, incluindo entre separadores. Um registo feito no Expo Go do iPhone não aparece automaticamente no navegador do computador: cada dispositivo tem o seu próprio armazenamento. Para agregação real entre dispositivos é necessário um backend com autenticação e permissões de administração. Não existe autenticação segura de administrador nesta demonstração.

Os testes automatizados cobrem OTP, expiração, tentativas, arredondamento, taxas, datas de reconhecimento, filtros por parceiro, períodos no fuso Maputo, liquidações sem duplicação e regras de avaliação, além das transições e pontos existentes. O empacotamento e os testes não substituem a revisão visual no dispositivo.
