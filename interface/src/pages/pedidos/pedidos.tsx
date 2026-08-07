import { useState } from 'react';
import { Plus, Eye, Edit2, Trash2, ShoppingCart } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { CustomInput } from '../../components/custom-input';
import { CustomSelect } from '../../components/custom-select';
import { CustomTable, type TableColumn } from '../../components/custom-table';
import { NewOrderModal } from './NewOrderModal';
import '../../styles/modal.css';
import './Pedidos.css';

interface Pedido {
  id: string;
  cliente: string;
  produtos: number;
  total: string;
  status: string;
  data: string;
  pagamento: string;
}

const MOCK_PEDIDOS: Pedido[] = [
  { id: '#1042', cliente: 'Maria Silva', produtos: 3, total: 'R$ 458,90', status: 'pendente', data: '06/08/2026', pagamento: 'Dinheiro' },
  { id: '#1041', cliente: 'Joao Santos', produtos: 5, total: 'R$ 1.230,00', status: 'em_preparo', data: '06/08/2026', pagamento: 'Cartao' },
  { id: '#1040', cliente: 'Ana Oliveira', produtos: 1, total: 'R$ 89,50', status: 'pronto', data: '05/08/2026', pagamento: 'Boleto' },
  { id: '#1039', cliente: 'Carlos Souza', produtos: 2, total: 'R$ 345,00', status: 'entregue', data: '05/08/2026', pagamento: 'Pix' },
  { id: '#1038', cliente: 'Lucia Ferreira', produtos: 4, total: 'R$ 672,30', status: 'atrasado', data: '04/08/2026', pagamento: 'Dinheiro' },
  { id: '#1037', cliente: 'Pedro Lima', produtos: 2, total: 'R$ 198,00', status: 'pendente', data: '04/08/2026', pagamento: 'Cartao' },
];

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_preparo', label: 'Em Preparo' },
  { value: 'pronto', label: 'Pronto' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'atrasado', label: 'Atrasado' },
];

const STATUS_BADGE: Record<string, string> = {
  pendente: 'ct-badge--warning',
  em_preparo: 'ct-badge--info',
  pronto: 'ct-badge--success',
  entregue: 'ct-badge--neutral',
  atrasado: 'ct-badge--danger',
};

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  em_preparo: 'Em Preparo',
  pronto: 'Pronto',
  entregue: 'Entregue',
  atrasado: 'Atrasado',
};

const columns: TableColumn<Pedido>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '70px',
    render: (row) => <span className="ct-mono">{row.id}</span>,
  },
  {
    key: 'cliente',
    header: 'Cliente',
    sortable: true,
    render: (row) => <span className="ct-name">{row.cliente}</span>,
  },
  { key: 'produtos', header: 'Produtos', width: '70px', align: 'center' },
  {
    key: 'total',
    header: 'Total',
    sortable: true,
    align: 'right',
    render: (row) => <span className="ct-total">{row.total}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    width: '110px',
    render: (row) => (
      <span className={`ct-badge ${STATUS_BADGE[row.status] ?? 'ct-badge--neutral'}`}>
        <span className="ct-badge__dot" />
        {STATUS_LABEL[row.status] ?? row.status}
      </span>
    ),
  },
  { key: 'data', header: 'Data', width: '95px', sortable: true },
  { key: 'pagamento', header: 'Pagamento', width: '95px' },
  {
    key: 'actions',
    header: '',
    width: '80px',
    align: 'center',
    render: () => (
      <div className="ct-actions">
        <button className="icon-btn icon-btn--xs" title="Detalhes"><Eye size={14} /></button>
        <button className="icon-btn icon-btn--xs" title="Editar"><Edit2 size={14} /></button>
        <button className="icon-btn icon-btn--xs icon-btn--danger" title="Excluir"><Trash2 size={14} /></button>
      </div>
    ),
  },
];

export function Pedidos() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showNewOrder, setShowNewOrder] = useState(false);

  const filtered = MOCK_PEDIDOS.filter((p) => {
    const matchSearch = !search || p.cliente.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
    const matchStatus = statusFilter === 'todos' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
        <CustomSelect
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      <div className="pedidos__counter">
        {filtered.length} pedido(s) encontrado(s)
      </div>

      <CustomTable<Pedido>
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        rowKey={(row) => row.id}
        emptyTitle="Nenhum pedido encontrado"
        emptyDescription='Clique em "Novo Pedido" para criar'
        emptyIcon={<ShoppingCart size={40} />}
      />

      <NewOrderModal open={showNewOrder} onClose={() => setShowNewOrder(false)} />
    </div>
  );
}
