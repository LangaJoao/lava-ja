import { useState } from "react";
import { router } from "expo-router";
import { useSession } from "../../auth/context/SessionContext";
import { useMobile } from "../../mobile/store";
import { money, roleNames, services, statusNames } from "../../mobile/data";
import {
  dayKey,
  earnedAt,
  inRange,
  orderAmounts,
  periodRange,
  ratingFor,
  reportFor,
  settlementCandidates,
} from "../../mobile/finance";
import "../styles/system.css";

function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv =
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((cell) => {
            let text = String(cell);
            if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
            return `"${text.replaceAll('"', '""')}"`;
          })
          .join(";"),
      )
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const sections = [
  "Visão geral",
  "Parceiros",
  "Utilizadores",
  "Financeiro",
  "Liquidações",
  "Avaliações",
  "Pedidos",
];
export default function SystemAdmin() {
  const { signOut } = useSession();
  const { users, partners, orders, settlements, settlePartner, storageError } =
    useMobile();
  const [section, setSection] = useState("Visão geral");
  const [period, setPeriod] = useState("week");
  const [anchor, setAnchor] = useState(() => dayKey());
  const [customStart, setCustomStart] = useState(() => dayKey());
  const [customEnd, setCustomEnd] = useState(() => dayKey());
  const [partnerId, setPartnerId] = useState("");
  const [query, setQuery] = useState("");
  const [references, setReferences] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const range =
    period === "custom"
      ? { start: customStart, end: customEnd }
      : periodRange(period, anchor);
  const valid = !!range.start && !!range.end && range.start <= range.end;
  const totals = reportFor(
    orders,
    valid ? range.start : "9999-12-31",
    valid ? range.end : "0000-01-01",
    partnerId || undefined,
  );
  const periodOrders = orders.filter(
    (o) =>
      (!partnerId || o.partnerId === partnerId) &&
      inRange(earnedAt(o), range.start, range.end),
  );
  const visiblePartners = partners.filter(
    (p) =>
      (!partnerId || p.id === partnerId) &&
      p.name.toLocaleLowerCase("pt").includes(query.toLocaleLowerCase("pt")),
  );
  const newUsers = users.filter((u) =>
    inRange(u.registeredAt, range.start, range.end),
  );
  const week = periodRange("week", dayKey()).start;
  const exportReport = () =>
    downloadCsv(`lava-ja-financeiro-${range.start}-${range.end}.csv`, [
      ["Período inicial", range.start, "Período final", range.end],
      [
        "Parceiro",
        "Pilar",
        "Taxa",
        "Operações",
        "Bruto MT",
        "Comissão MT",
        "Líquido MT",
      ],
      ...visiblePartners.map((p) => {
        const r = reportFor(orders, range.start, range.end, p.id);
        return [
          p.name,
          p.pillar === "carwash" ? "Car Wash" : "Prestador",
          p.pillar === "carwash" ? "10%" : "5%",
          r.count,
          (r.grossCents / 100).toFixed(2),
          (r.feeCents / 100).toFixed(2),
          (r.netCents / 100).toFixed(2),
        ];
      }),
    ]);
  const partnerTable = (
    <div className="sys-table">
      <table>
        <thead>
          <tr>
            {[
              "Parceiro",
              "Pilar / taxa",
              "Registo",
              "Operações",
              "Bruto",
              "Comissão",
              "Líquido parceiro",
              "Avaliação",
            ].map((t) => (
              <th key={t}>{t}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visiblePartners.map((p) => {
            const r = reportFor(orders, range.start, range.end, p.id);
            const rating = ratingFor(orders, p.id);
            return (
              <tr key={p.id}>
                <td>
                  <button
                    className="sys-link"
                    onClick={() => {
                      setPartnerId(p.id);
                      setSection("Financeiro");
                    }}
                  >
                    {p.name}
                  </button>
                </td>
                <td>
                  {p.pillar === "carwash" ? "Car Wash · 10%" : "Prestador · 5%"}
                </td>
                <td>{dayKey(new Date(p.registeredAt))}</td>
                <td>{r.count}</td>
                <td>{money(r.grossCents / 100)}</td>
                <td className="sys-fee">{money(r.feeCents / 100)}</td>
                <td>{money(r.netCents / 100)}</td>
                <td>
                  {rating.count
                    ? `★ ${rating.average.toFixed(1)} (${rating.count})`
                    : "Sem avaliações"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!visiblePartners.length && (
        <p className="sys-empty">Nenhum parceiro encontrado.</p>
      )}
    </div>
  );
  return (
    <div className="sys-admin">
      <aside className="sys-sidebar">
        <div className="sys-brand">
          <b>LJ</b>
          <div>
            Lava Já<small>ADMINISTRAÇÃO DO SISTEMA</small>
          </div>
        </div>
        <nav aria-label="Administração">
          {sections.map((name, i) => (
            <button
              key={name}
              className={section === name ? "active" : ""}
              onClick={() => {
                setSection(name);
                setQuery("");
              }}
            >
              <span>{["◈", "▤", "♙", "↗", "⇄", "★", "▦"][i]}</span>
              {name}
            </button>
          ))}
        </nav>
        <div className="sys-sidebar-bottom">
          <p>Demonstração local</p>
          <small>
            Dados ilustrativos e registos deste navegador. Sem transferências
            reais.
          </small>
          <button
            onClick={() => {
              signOut();
              router.replace("/onboarding");
            }}
          >
            Sair da administração
          </button>
        </div>
      </aside>
      <main>
        <header className="sys-topbar">
          <span>
            Administração / <strong>{section}</strong>
          </span>
          <span className="sys-admin-badge">AD · Administrador</span>
        </header>
        <div className="sys-content">
          <div className="sys-heading">
            <div>
              <p className="sys-eyebrow">LAVA JÁ · DESEMPENHO DA PLATAFORMA</p>
              <h1>{section}</h1>
              <p>
                Utilizadores, parceiros e resultados financeiros num só lugar.
              </p>
            </div>
            <button
              className="sys-primary"
              disabled={!valid}
              onClick={exportReport}
            >
              Exportar relatório CSV
            </button>
          </div>
          <div className="sys-banner">
            Demonstração: os dados são partilhados entre os perfis e separadores
            deste navegador. O telemóvel e outros dispositivos têm dados locais
            independentes. Não é um acesso de administração seguro de produção.
          </div>
          <section className="sys-filters" aria-label="Filtros de relatórios">
            <label>
              Período
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="day">Diário</option>
                <option value="week">Semanal</option>
                <option value="month">Mensal</option>
                <option value="custom">Personalizado</option>
              </select>
            </label>
            {period === "custom" ? (
              <>
                <label>
                  Desde
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                </label>
                <label>
                  Até
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                </label>
              </>
            ) : (
              <label>
                Data de referência
                <input
                  type="date"
                  value={anchor}
                  onChange={(e) => {
                    if (e.target.value) setAnchor(e.target.value);
                  }}
                />
              </label>
            )}
            <label>
              Parceiro
              <select
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
              >
                <option value="">Todos os parceiros</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Pesquisar
              <input
                placeholder="Nome do parceiro ou utilizador"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </section>
          <p className="sys-period">
            {valid
              ? `${range.start} a ${range.end} · fuso Africa/Maputo`
              : "Selecciona um intervalo válido."}
          </p>
          {storageError && (
            <p role="alert">Não foi possível guardar ou ler os dados locais.</p>
          )}
          <div role="status" className="sys-notice">
            {notice}
          </div>
          {(section === "Visão geral" || section === "Utilizadores") && (
            <section className="sys-stats">
              {[
                [
                  "Utilizadores registados",
                  users.length,
                  `${newUsers.length} novos no período`,
                ],
                [
                  "Car Wash registados",
                  partners.filter((p) => p.pillar === "carwash").length,
                  "Pilar 1 · comissão de 10%",
                ],
                [
                  "Prestadores registados",
                  partners.filter((p) => p.pillar === "provider").length,
                  "Pilar 2 · comissão de 5%",
                ],
                [
                  "Clientes registados",
                  users.filter((u) => u.role === "client").length,
                  "Contas com OTP demonstrativo",
                ],
              ].map(([label, value, caption]) => (
                <article key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{caption}</small>
                </article>
              ))}
            </section>
          )}
          {["Visão geral", "Financeiro"].includes(section) && (
            <>
              <section className="sys-stats">
                {[
                  [
                    "Volume bruto",
                    money(totals.grossCents / 100),
                    `${totals.count} operações no período`,
                  ],
                  [
                    "Receita da plataforma",
                    money(totals.feeCents / 100),
                    "Comissões calculadas",
                  ],
                  [
                    "Líquido dos parceiros",
                    money(totals.netCents / 100),
                    "Após comissão da plataforma",
                  ],
                  [
                    "Ticket médio",
                    money(
                      totals.count ? totals.grossCents / 100 / totals.count : 0,
                    ),
                    "Por operação reconhecida",
                  ],
                ].map(([label, value, caption]) => (
                  <article key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <small>{caption}</small>
                  </article>
                ))}
              </section>
              <section className="sys-panel">
                <div className="sys-panel-heading">
                  <h2>Desempenho financeiro por parceiro</h2>
                  <p>
                    Car Wash: reconhecido ao concluir o serviço. Prestador:
                    reconhecido ao preencher/aceitar a vaga. Cancelamentos e
                    rejeições são excluídos.
                  </p>
                </div>
                {partnerTable}
              </section>
              <section className="sys-panel">
                <div className="sys-panel-heading">
                  <h2>Operações do período</h2>
                  <p>
                    O valor bruto não representa lucro. Os custos da empresa e
                    despesas operacionais não estão incluídos.
                  </p>
                </div>
                <div className="sys-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Parceiro</th>
                        <th>Serviço</th>
                        <th>Bruto</th>
                        <th>Taxa</th>
                        <th>Comissão</th>
                        <th>Líquido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periodOrders.map((o) => {
                        const a = orderAmounts(o);
                        return (
                          <tr key={o.id}>
                            <td>{dayKey(new Date(earnedAt(o)!))}</td>
                            <td>
                              {partners.find((p) => p.id === o.partnerId)
                                ?.name || o.wash}
                            </td>
                            <td>
                              {services.find((s) => s.id === o.serviceId)?.name}
                            </td>
                            <td>{money(a.grossCents / 100)}</td>
                            <td>
                              {(o.commissionBps ||
                                (o.channel === "carwash" ? 1000 : 500)) / 100}
                              %
                            </td>
                            <td>{money(a.feeCents / 100)}</td>
                            <td>{money(a.netCents / 100)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!periodOrders.length && (
                    <p className="sys-empty">Sem operações neste período.</p>
                  )}
                </div>
              </section>
            </>
          )}
          {section === "Parceiros" && (
            <section className="sys-panel">
              <div className="sys-panel-heading">
                <h2>Parceiros registados</h2>
                <p>
                  Selecciona um parceiro para consultar o seu relatório
                  individual.
                </p>
              </div>
              {partnerTable}
            </section>
          )}
          {section === "Utilizadores" && (
            <section className="sys-panel">
              <div className="sys-panel-heading">
                <h2>Utilizadores da plataforma</h2>
                <p>
                  Totais de registo acumulados; data e perfil por utilizador. A
                  verificação OTP é simulada.
                </p>
              </div>
              <div className="sys-table">
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Perfil</th>
                      <th>Telemóvel</th>
                      <th>Registo</th>
                      <th>Verificação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u) =>
                        `${u.name} ${u.phone}`
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                      )
                      .map((u) => (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{roleNames[u.role]}</td>
                          <td>{u.phone}</td>
                          <td>{dayKey(new Date(u.registeredAt))}</td>
                          <td>
                            <span className="sys-tag">OTP demo</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {section === "Liquidações" && (
            <>
              <div className="sys-banner">
                Car Wash: liquidação semanal por transferência bancária formal.
                Apenas semanas encerradas entram no lote. Este painel regista
                uma simulação; não movimenta dinheiro. Pagamentos no local são
                apresentados como comissão a cobrar ao parceiro.
              </div>
              <section className="sys-panel">
                <div className="sys-panel-heading">
                  <h2>Saldos acumulados dos Car Wash</h2>
                  <p>
                    Semana actual: {week}. Os saldos abaixo são acumulados até
                    hoje e independentes do filtro de relatórios.
                  </p>
                </div>
                <div className="sys-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Car Wash</th>
                        <th>A liquidar (semanas encerradas)</th>
                        <th>Semana actual</th>
                        <th>Comissão a cobrar no local</th>
                        <th>Referência bancária simulada</th>
                        <th>Acção</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visiblePartners
                        .filter((p) => p.pillar === "carwash")
                        .map((p) => {
                          const candidates = settlementCandidates(
                            orders,
                            settlements,
                            p.id,
                            week,
                          );
                          const amount = candidates.reduce(
                            (n, o) => n + orderAmounts(o).netCents,
                            0,
                          );
                          const current = orders
                            .filter(
                              (o) =>
                                o.partnerId === p.id &&
                                o.status === "completed" &&
                                o.completedAt &&
                                dayKey(new Date(o.completedAt)) >= week &&
                                o.payment !== "Pagar no Local",
                            )
                            .reduce((n, o) => n + orderAmounts(o).netCents, 0);
                          const cashFee = orders
                            .filter(
                              (o) =>
                                o.partnerId === p.id &&
                                o.status === "completed" &&
                                o.payment === "Pagar no Local",
                            )
                            .reduce((n, o) => n + orderAmounts(o).feeCents, 0);
                          return (
                            <tr key={p.id}>
                              <td>{p.name}</td>
                              <td>{money(amount / 100)}</td>
                              <td>{money(current / 100)}</td>
                              <td>{money(cashFee / 100)}</td>
                              <td>
                                <input
                                  aria-label={`Referência ${p.name}`}
                                  placeholder="Ex: DEMO-TRF-001"
                                  value={references[p.id] || ""}
                                  onChange={(e) =>
                                    setReferences((r) => ({
                                      ...r,
                                      [p.id]: e.target.value,
                                    }))
                                  }
                                />
                              </td>
                              <td>
                                <button
                                  className="sys-primary"
                                  disabled={
                                    !amount || !references[p.id]?.trim()
                                  }
                                  onClick={() => {
                                    settlePartner(p.id, references[p.id]);
                                    setNotice(
                                      "Liquidação simulada registada. Nenhuma transferência foi executada.",
                                    );
                                  }}
                                >
                                  Registar simulação
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="sys-panel">
                <div className="sys-panel-heading">
                  <h2>Histórico de liquidações simuladas</h2>
                </div>
                <div className="sys-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Parceiro</th>
                        <th>Referência</th>
                        <th>Serviços</th>
                        <th>Líquido liquidado</th>
                        <th>Comissão retida</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlements
                        .filter((s) => !partnerId || s.partnerId === partnerId)
                        .map((s) => (
                          <tr key={s.id}>
                            <td>{dayKey(new Date(s.createdAt))}</td>
                            <td>
                              {partners.find((p) => p.id === s.partnerId)?.name}
                            </td>
                            <td>{s.reference}</td>
                            <td>{s.orderIds.length}</td>
                            <td>{money(s.amountCents / 100)}</td>
                            <td>{money(s.commissionCents / 100)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {!settlements.length && (
                    <p className="sys-empty">Nenhuma liquidação registada.</p>
                  )}
                </div>
              </section>
            </>
          )}
          {section === "Avaliações" && (
            <section className="sys-panel">
              <div className="sys-panel-heading">
                <h2>Avaliações dos clientes</h2>
                <p>
                  Uma avaliação por serviço concluído e confirmado pelo cliente.
                </p>
              </div>
              <div className="sys-table">
                <table>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Parceiro</th>
                      <th>Estrelas</th>
                      <th>Comentário</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter(
                        (o) =>
                          o.review &&
                          (!partnerId || o.partnerId === partnerId) &&
                          inRange(o.review.createdAt, range.start, range.end),
                      )
                      .map((o) => (
                        <tr key={o.id}>
                          <td>{o.client}</td>
                          <td>
                            {partners.find((p) => p.id === o.partnerId)?.name ||
                              o.wash}
                          </td>
                          <td>{"★".repeat(o.review!.stars)}</td>
                          <td className="sys-comment">
                            {o.review!.comment || "Sem comentário"}
                          </td>
                          <td>{dayKey(new Date(o.review!.createdAt))}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {section === "Pedidos" && (
            <section className="sys-panel">
              <div className="sys-panel-heading">
                <h2>Pedidos da aplicação</h2>
                <p>
                  Visão global dos pedidos; a operação dos serviços é feita nas
                  áreas Car Wash e Prestador.
                </p>
              </div>
              <div className="sys-table">
                <table>
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Parceiro</th>
                      <th>Pilar</th>
                      <th>Valor</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter(
                        (o) =>
                          (!partnerId || o.partnerId === partnerId) &&
                          `${o.client} ${o.id}`
                            .toLowerCase()
                            .includes(query.toLowerCase()),
                      )
                      .map((o) => (
                        <tr key={o.id}>
                          <td>{o.id}</td>
                          <td>{o.client}</td>
                          <td>
                            {partners.find((p) => p.id === o.partnerId)?.name ||
                              o.wash}
                          </td>
                          <td>
                            {o.channel === "carwash" ? "Car Wash" : "Prestador"}
                          </td>
                          <td>{money(o.price)}</td>
                          <td>{statusNames[o.status]}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          <footer className="sys-footer">
            Lava Já · Valores em meticais (MT) · Comissões e liquidações
            demonstrativas
          </footer>
        </div>
      </main>
    </div>
  );
}
