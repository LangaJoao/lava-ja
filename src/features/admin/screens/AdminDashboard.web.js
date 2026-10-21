import { useState } from 'react';
import { useSession } from '../../auth/context/SessionContext';
import { services } from '../../../shared/data/services';
import { demoOrders } from '../data/demoOrders';
import '../styles/dashboard.css';

const money = value => `${value.toLocaleString('pt-PT')} MT`;

export default function AdminDashboard() {
  const { signOut } = useSession();
  const [section, setSection] = useState('Pedidos');
  const [orders, setOrders] = useState(demoOrders);
  const [filter, setFilter] = useState('Todos');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const completed = orders.filter(order => order.done);
  const visible = orders.filter(order => (filter === 'Todos' || order.done === (filter === 'Concluídos')) && `${order.client} ${order.car} ${order.id}`.toLocaleLowerCase('pt').includes(query.toLocaleLowerCase('pt')));
  const points = completed.reduce((sum, order) => sum + order.service.points, 0);
  function complete(id) {
    setOrders(current => current.map(order => order.id === id ? { ...order, done: true } : order));
    setNotice(`Lavagem ${id} concluída. O resumo e os pontos foram atualizados nesta demonstração.`);
  }
  return <div className="admin-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-symbol">LJ</span><span>Lava Já<small>GESTÃO · MATOLA</small></span></div>
      <p className="sidebar-label">ESPAÇO DE TRABALHO</p>
      <nav aria-label="Administração">{['Pedidos', 'Serviços', 'Fidelização'].map((name, index) => <button key={name} className={section === name ? 'nav-item active' : 'nav-item'} aria-current={section === name ? 'page' : undefined} onClick={() => setSection(name)}><span aria-hidden="true">{['▦', '≡', '◇'][index]}</span>{name}{name === 'Pedidos' && <b>{orders.length - completed.length}</b>}</button>)}</nav>
      <div className="sidebar-bottom"><p className="demo-label">● Modo demonstração</p><p>Explora à vontade.<br />Os dados são apenas exemplos.</p><button className="logout" onClick={signOut}>Sair da conta <span aria-hidden="true">↗</span></button></div>
    </aside>
    <main className="admin-main">
      <header className="topbar"><span>Painel de administração <span className="breadcrumb">/ {section}</span></span><div className="user"><span className="avatar">AD</span><span>Administrador<small>Acesso de demonstração</small></span></div></header>
      <div className="admin-content">
        <div className="page-heading"><div><p className="eyebrow">LAVA JÁ · O TEU NEGÓCIO NUM SÓ LUGAR</p><h1>{section === 'Pedidos' ? 'Cada lavagem, sob controlo.' : section === 'Serviços' ? 'Cuidados para cada carro.' : 'Cada visita conta.'}</h1><p>{section === 'Pedidos' ? 'Acompanha os pedidos e mantém tudo a andar.' : section === 'Serviços' ? 'Consulta o catálogo de lavagens disponível no app.' : 'Consulta os pontos das lavagens concluídas.'}</p></div><button className="outline-button" onClick={() => { setOrders(demoOrders); setNotice('Os dados de exemplo foram repostos.'); }}>↻ Repor demonstração</button></div>
        <div className="demo-banner"><span aria-hidden="true">ⓘ</span><span><strong>Este é o teu painel de demonstração.</strong> As alterações reiniciam ao sair. Não há ligação a pedidos reais do app.</span><small>PROTÓTIPO</small></div>
        <section className="stats" aria-label="Resumo dos pedidos de exemplo">
          {[['Pedidos no total', orders.length, 'Na lista de demonstração', '▦'], ['Por concluir', orders.length - completed.length, 'À espera do próximo cuidado', '◷'], ['Valor concluído', money(completed.reduce((sum, order) => sum + order.service.price, 0)), `${completed.length} lavagens concluídas`, '↗'], ['Pontos atribuídos', points, 'Fidelização na demonstração', '◇']].map(([label, value, caption, icon]) => <article className="stat-card" key={label}><div>{label}<span aria-hidden="true">{icon}</span></div><strong>{value}</strong><small>{caption}</small></article>)}
        </section>
        <div className="notice" role="status" aria-live="polite">{notice}</div>
        {section === 'Pedidos' && <section className="panel"><div className="panel-heading"><div><h2>Pedidos de lavagem</h2><p>Organiza o trabalho, uma lavagem de cada vez.</p></div><label className="search"><span aria-hidden="true">⌕</span><input aria-label="Pesquisar pedidos" placeholder="Pesquisar cliente ou viatura…" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
          <div className="filters">{['Todos', 'Pendentes', 'Concluídos'].map(name => <button key={name} aria-pressed={filter === name} className={filter === name ? 'filter active' : 'filter'} onClick={() => setFilter(name)}>{name}</button>)}<span>{visible.length} pedidos</span></div>
          <div className="table-scroll"><table><thead><tr>{['Cliente / viatura', 'Serviço', 'Hora ilustrativa', 'Valor', 'Estado', 'Ação'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{visible.map(order => <tr key={order.id}><td><div className="client-cell"><span className="client-avatar">{order.client.split(' ').map(word => word[0]).join('')}</span><div><strong>{order.client}</strong><small>{order.car} · {order.id}</small></div></div></td><td>{order.service.name}</td><td>{order.time}</td><td className="amount">{money(order.service.price)}</td><td><span className={`badge ${order.done ? 'done' : 'pending'}`}>● {order.done ? 'Concluído' : 'Pendente'}</span></td><td>{order.done ? <span className="completed">✓ Concluído</span> : <button className="complete-button" aria-label={`Concluir lavagem de ${order.client}`} onClick={() => complete(order.id)}>Concluir →</button>}</td></tr>)}</tbody></table></div>
          {visible.length === 0 && <div className="empty"><h3>Nenhum pedido encontrado</h3><p>Experimenta outro nome ou muda o filtro.</p><button className="outline-button" onClick={() => { setFilter('Todos'); setQuery(''); }}>Limpar pesquisa</button></div>}
          <div className="panel-footer">Valores e horários ilustrativos · moeda: metical (MT)</div>
        </section>}
        {section === 'Serviços' && <section className="catalog" aria-label="Catálogo de serviços">{services.map((service, index) => <article key={service.id}><span className="catalog-number">0{index + 1}</span><h2>{service.name}</h2><p>{service.description}</p><strong>{money(service.price)}</strong><span className="points">+{service.points} pontos por lavagem</span><small>Preço ilustrativo · catálogo de demonstração</small></article>)}</section>}
        {section === 'Fidelização' && <section className="panel"><div className="panel-heading"><div><h2>Pontos por cliente</h2><p>Os pontos são atribuídos ao concluir uma lavagem de exemplo.</p></div></div><div className="table-scroll"><table><thead><tr><th scope="col">Cliente</th><th scope="col">Lavagens concluídas</th><th scope="col">Pontos</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><strong>{order.client}</strong></td><td>{order.done ? 1 : 0}</td><td><span className="points">{order.done ? order.service.points : 0} pontos</span></td></tr>)}</tbody></table></div></section>}
        <footer className="admin-footer"><span>Lava Já · Matola</span><span>Mais cuidado. Mais confiança.</span></footer>
      </div>
    </main>
  </div>;
}
