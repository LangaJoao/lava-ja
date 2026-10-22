# Lava Já — referências e implementação mobile

Foram analisados os 21 PNGs em `assets/design-screenshots`: 17 interfaces e quatro separadores de grupos. `flutterflow-export.txt` estava vazio. O projecto existente foi mantido e as novas áreas foram implementadas em TypeScript com Expo Router, para Expo Go SDK 57.

## Correspondência com os exports

| Referência                    | Rota                                        |
| ----------------------------- | ------------------------------------------- |
| Splash Screen                 | `/`                                         |
| Onboarding & Role Selection   | `/onboarding`                               |
| Shared Login                  | `/login`                                    |
| Client Registration & Garage  | `/garage`                                   |
| New Screen 1                  | `/mobile/client`                            |
| Car Wash Detail Page          | `/wash/brilho` (também `liberdade` e `uem`) |
| Booking & Payment             | `/booking?wash=brilho&service=complete`     |
| Loyalty & Points Wallet       | `/mobile/client/points`                     |
| AI Assistant Bottom Sheet     | `/assistant?kind=explore`                   |
| Car Wash Registration         | `/business-setup`                           |
| Business Dashboard (Car Wash) | `/mobile/carwash`                           |
| Reservation Management        | `/mobile/carwash/reservations`              |
| New Screen 2                  | `/assistant?kind=business`                  |
| Provider Registration         | `/provider-setup`                           |
| Provider Dashboard            | `/mobile/provider`                          |
| Provider Active Job           | `/job/LV-1042`                              |
| New Screen 3                  | `/assistant?kind=provider`                  |

Os quatro PNGs `Label_ GRUPO …` são separadores do Designer e não são ecrãs da aplicação.

Destinos complementares: registo inicial, recuperação de acesso, fotografias do Car Wash, confirmação e acompanhamento da reserva, pesquisa, histórico, perfis, notificações, serviços, desempenho, agenda, ganhos, reporte de problema, conteúdos de aprendizagem e detalhes dos locais sugeridos. Estes destinos seguem a identidade visual das referências; não existiam desenhos completos para todos eles.

## Design

- Vermelho `#BE1733`, azul-marinho `#172033`, fundo `#F5F6F8`, branco, texto secundário `#687B96`, borda `#E1E7EF`, verde `#10A64B` e amarelo `#F0B400`.
- Poppins nos pesos 400, 500, 600 e 700; aproximação à tipografia observada, sem metadados que confirmem a família original.
- Cartões arredondados, formulários com ícones, barras inferiores por perfil e rodapés com acção principal.
- As fotografias e o mapa em `assets/mobile` foram recortados das referências fornecidas. Não se usa uma captura completa como interface.
- Corrigidos na reprodução: texto ilegível em fundos escuros, sobreposições, selecções múltiplas indevidas e a expressão literal no histórico de pontos.
- A imagem danificada da capa do detalhe foi substituída por uma fotografia de lavagem das próprias referências.

## Percurso de verificação manual

1. Abrir o QR Code com Expo Go compatível com SDK 57.
2. Escolher Cliente → Entrar → Explorar como Cliente (ou percorrer o registo e a garagem).
3. Pesquisar e filtrar Car Wash; abrir um marcador ou cartão; escolher serviço → Reservar Agora.
4. Escolher veículo, dia, horário e método; Confirmar e Pagar. O pagamento é simulado.
5. Ver a reserva pendente em Reservas. Abrir Perfil → Mudar para Car Wash.
6. Em Reservas, aceitar o pedido criado. Seleccionar Atendimento → Iniciar atendimento.
7. Avançar as etapas e marcar a checklist. Concluir Serviço.
8. Em Perfil, mudar para Cliente. Ver a reserva concluída e o crédito na carteira de pontos.
9. Resgatar uma recompensa e verificar o débito no histórico.
10. Mudar para Prestador: testar disponibilidade, aceitar/rejeitar pedidos, agenda e o trabalho `LV-1042`; concluir a checklist e verificar ganhos.
11. Abrir os três assistentes, enviar perguntas, abrir sugestões, detalhes, mapa e conteúdos de aprendizagem.
12. Testar o registo Car Wash com serviços, horários, preços, rascunho e fotografias; testar o registo Prestador com foto e especialidades.
13. Reabrir a aplicação: os dados locais devem manter-se. A sessão de demonstração começa novamente pela escolha de perfil.

## Limites desta entrega

Autenticação, recuperação de acesso, pagamentos, chamadas, IA e mapas com localização/rotas reais não estão ligados a serviços externos. Os assistentes têm exemplos e respostas locais identificados como demonstração. Os dados são partilhados entre perfis e separadores da mesma origem no navegador; continuam independentes entre dispositivos. Os ganhos passaram a usar as operações registadas e as comissões de cada pilar, sem saldo fictício adicional. O [roteiro das funcionalidades da plataforma](platform-features.md) descreve o OTP demonstrativo, a administração web, as avaliações e a monetização acrescentados posteriormente.

O catálogo/preços configurados no Car Wash alimentam o estabelecimento `brilho`; os restantes estabelecimentos mantêm catálogos ilustrativos. Fotografias escolhidas na galeria usam os URIs devolvidos pelo sistema, cuja disponibilidade futura depende do dispositivo.

O splash dentro da aplicação pode ser revisto no Expo Go. O splash nativo definitivo deve ser validado numa build de preview/produção.

A validação visual automatizada foi interrompida pelo computer-use: a ferramenta não conseguiu confirmar com segurança o URL actual do Chrome. Não foi feita verificação visual final em Android/iOS. O empacotamento não substitui essa verificação.
