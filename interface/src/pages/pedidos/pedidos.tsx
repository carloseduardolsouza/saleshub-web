import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Eye, Trash2, ShoppingCart, Edit2, Search, AlertCircle } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { CustomTable, type TableColumn } from '../../components/custom-table';
import { NewOrderModal } from './NewOrderModal';
import { EditPedidoModal } from './EditPedidoModal';
import { DetailsPedidoModal } from './DetailsPedidoModal';
import { api, type Pedido } from '../../api/client';
import { STATUS_PEDIDO, formatBRL, labelMetodo, labelStatus } from './pedidoUtils';
import '../../styles/modal.css';
import '../pages-common.css';
import './pedidos.css';

export function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showEditPedido, setShowEditPedido] = useState(false);
  const [showDetailsPedido, setShowDetailsPedido] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  const loadData = useCallback(async () => {
    try {
      setPedidos(await api.pedidos.getAll());
      setLoadError('');
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pedidos.filter((p) =>
      (!statusFilter || (p.status || 'pendente') === statusFilter) &&
      (!q || p.cliente.toLowerCase().includes(q) || String(p.id).includes(q))
    );
  }, [pedidos, search, statusFilter]);

  const totalFiltrado = filtered.reduce((s, p) => s + (p.status === 'cancelado' ? 0 : p.total), 0);

  async function handleDelete(id: number): Promise<boolean> {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return false;
    try {
      await api.pedidos.delete(id);
      setPedidos((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir pedido');
      return false;
    }
  }

  function handleStatusChange(updated: Pedido) {
    setPedidos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedPedido(updated);
  }

  const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString('pt-BR') : '-');

  const columns: TableColumn<Pedido>[] = [
    { key: 'id', header: 'ID', width: '70px', render: (row) => <span className="ct-mono">#{row.id}</span> },
    { key: 'cliente', header: 'Cliente', sortable: true, render: (row) => <span className="ct-name">{row.cliente}</span> },
    { key: 'produtos', header: 'Itens', width: '70px', align: 'center', render: (row) => String(row.produtos?.length || 0) },
    { key: 'total', header: 'Total', sortable: true, align: 'right', render: (row) => <span className="ct-total">{formatBRL(row.total)}</span> },
    { key: 'data', header: 'Data', width: '95px', sortable: true, render: (row) => formatDate(row.data) },
    { key: 'metodoPagamento', header: 'Pagamento', width: '100px', render: (row) => labelMetodo(row.metodoPagamento) },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (row) => {
        const s = row.status || 'pendente';
        return <span className={`status-badge status-badge--${s}`}>{labelStatus(s)}</span>;
      },
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      align: 'center',
      render: (row) => (
        <div className="ct-actions">
          <button className="icon-btn icon-btn--xs" title="Detalhes" aria-label="Detalhes" onClick={(e) => { e.stopPropagation(); setSelectedPedido(row); setShowDetailsPedido(true); }}><Eye size={14} /></button>
          <button className="icon-btn icon-btn--xs" title="Editar" aria-label="Editar" onClick={(e) => { e.stopPropagation(); setSelectedPedido(row); setShowEditPedido(true); }}><Edit2 size={14} /></button>
          <button className="icon-btn icon-btn--xs icon-btn--danger" title="Excluir" aria-label="Excluir" onClick={(e) => { e.stopPropagation(); handleDelete(row.id!); }}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="pedidos page-enter">
      <div className="pedidos__header">
        <div>
          <h1 className="pedidos__title">Pedidos</h1>
          <p className="pedidos__subtitle">Acompanhe e gerencie suas notas de pedido</p>
        </div>
        <CustomButton variant="primary" icon={<Plus size={16} />} onClick={() => setShowNewOrder(true)}>
          Novo Pedido
        </CustomButton>
      </div>

      <div className="pedidos__filters">
        <label className="pedidos__search">
          <Search size={16} />
          <input
            placeholder="Buscar por cliente ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="pedidos__chips">
          <button className={`pedidos__chip ${!statusFilter ? 'pedidos__chip--active' : ''}`} onClick={() => setStatusFilter('')}>Todos</button>
          {STATUS_PEDIDO.map((s) => (
            <button
              key={s.value}
              className={`pedidos__chip ${statusFilter === s.value ? 'pedidos__chip--active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === s.value ? '' : s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <div className="order-alert" role="alert">
          <AlertCircle size={16} /> {loadError}
          <button className="pedidos__retry" onClick={() => { setLoading(true); loadData(); }}>Tentar novamente</button>
        </div>
      )}

      <div className="pedidos__counter">
        {filtered.length} pedido(s) · total {formatBRL(totalFiltrado)}
      </div>

      <CustomTable<Pedido>
        columns={columns}
        data={filtered}
        loading={loading}
        rowKey={(row) => row.id!}
        onRowClick={(row) => { setSelectedPedido(row); setShowDetailsPedido(true); }}
        emptyTitle="Nenhum pedido encontrado"
        emptyDescription='Clique em "Novo Pedido" para criar'
        emptyIcon={<ShoppingCart size={40} />}
      />

      <NewOrderModal open={showNewOrder} onClose={() => { setShowNewOrder(false); loadData(); }} />
      <EditPedidoModal
        open={showEditPedido}
        pedido={selectedPedido}
        onClose={() => { setShowEditPedido(false); setSelectedPedido(null); loadData(); }}
      />
      <DetailsPedidoModal
        open={showDetailsPedido}
        pedido={selectedPedido}
        onClose={() => { setShowDetailsPedido(false); setSelectedPedido(null); }}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
