import { useState, useEffect } from 'react';
import { Plus, Eye, Trash2, ShoppingCart, Edit2 } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { CustomInput } from '../../components/custom-input';
import { CustomTable, type TableColumn } from '../../components/custom-table';
import { NewOrderModal } from './NewOrderModal';
import { EditPedidoModal } from './EditPedidoModal';
import { DetailsPedidoModal } from './DetailsPedidoModal';
import { api, type Pedido } from '../../api/client';
import '../../styles/modal.css';
import './Pedidos.css';

export function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showEditPedido, setShowEditPedido] = useState(false);
  const [showDetailsPedido, setShowDetailsPedido] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  async function loadData() {
    try {
      const data = await api.pedidos.getAll();
      setPedidos(data);
    } catch {
      console.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, []);

  const filtered = pedidos.filter((p) => {
    return !search || p.cliente.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search);
  });

  async function handleDelete(id: number) {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      await api.pedidos.delete(id);
      setPedidos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Erro ao excluir pedido');
    }
  }

  function handleViewDetails(pedido: Pedido) {
    setSelectedPedido(pedido);
    setShowDetailsPedido(true);
  }

  function handleEditPedido(pedido: Pedido) {
    setSelectedPedido(pedido);
    setShowEditPedido(true);
  }

  function formatPrice(total: number) {
    return `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }

  function formatDate(date?: string) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  const columns: TableColumn<Pedido>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '70px',
      render: (row) => <span className="ct-mono">#{row.id}</span>,
    },
    {
      key: 'cliente',
      header: 'Cliente',
      sortable: true,
      render: (row) => <span className="ct-name">{row.cliente}</span>,
    },
    {
      key: 'produtos',
      header: 'Produtos',
      width: '70px',
      align: 'center',
      render: (row) => String(row.produtos?.length || 0),
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      align: 'right',
      render: (row) => <span className="ct-total">{formatPrice(row.total)}</span>,
    },
    {
      key: 'data',
      header: 'Data',
      width: '95px',
      sortable: true,
      render: (row) => formatDate(row.data),
    },
    {
      key: 'metodoPagamento',
      header: 'Pagamento',
      width: '95px',
      render: (row) => row.metodoPagamento,
    },
    {
      key: 'actions',
      header: '',
      width: '100px',
      align: 'center',
      render: (row) => (
        <div className="ct-actions">
          <button className="icon-btn icon-btn--xs" title="Detalhes" onClick={(e) => { e.stopPropagation(); handleViewDetails(row); }}><Eye size={14} /></button>
          <button className="icon-btn icon-btn--xs" title="Editar" onClick={(e) => { e.stopPropagation(); handleEditPedido(row); }}><Edit2 size={14} /></button>
          <button className="icon-btn icon-btn--xs icon-btn--danger" title="Excluir" onClick={(e) => { e.stopPropagation(); handleDelete(row.id!); }}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="pedidos"><p>Carregando...</p></div>;
  }

  return (
    <div className="pedidos">
      <div className="pedidos__header">
        <h1 className="pedidos__title">Pedidos</h1>
        <CustomButton variant="primary" icon={<Plus size={16} />} onClick={() => setShowNewOrder(true)}>
          Novo Pedido
        </CustomButton>
      </div>

      <div className="pedidos__filters">
        <div className="pedidos__search">
          <CustomInput
            placeholder="Buscar por cliente ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="pedidos__counter">
        {filtered.length} pedido(s) encontrado(s)
      </div>

      <CustomTable<Pedido>
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id!}
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
      />
    </div>
  );
}
