import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, Users } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { CustomInput } from '../../components/custom-input';
import { CustomTable, type TableColumn } from '../../components/custom-table';
import { NewClienteModal } from './NewClienteModal';
import { EditClienteModal } from './EditClienteModal';
import { api, type Cliente } from '../../api/client';
import '../../styles/modal.css';
import './Clientes.css';

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewCliente, setShowNewCliente] = useState(false);
  const [showEditCliente, setShowEditCliente] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  async function loadData() {
    try {
      const data = await api.clientes.getAll();
      setClientes(data);
    } catch {
      console.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, []);

  const filtered = clientes.filter((c) => {
    return !search || c.nomeFantasia.toLowerCase().includes(search.toLowerCase()) || (c.email && c.email.toLowerCase().includes(search.toLowerCase()));
  });

  async function handleDelete(id: number) {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await api.clientes.delete(id);
      setClientes((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Erro ao excluir cliente');
    }
  }

  function formatDate(date?: string) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  const columns: TableColumn<Cliente>[] = [
    {
      key: 'nomeFantasia',
      header: 'Nome',
      sortable: true,
      render: (row) => <span className="ct-name">{row.nomeFantasia}</span>,
    },
    {
      key: 'telefone',
      header: 'Telefone',
      render: (row) => (
        <span className="ct-contact"><Phone size={13} /> {row.telefone || '-'}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => (
        <span className="ct-contact"><Mail size={13} /> {row.email || '-'}</span>
      ),
    },
    {
      key: 'enderecoCidade',
      header: 'Cidade',
      sortable: true,
      render: (row) => row.enderecoCidade || '-',
    },
    {
      key: 'dataCadastro',
      header: 'Cadastro',
      width: '110px',
      render: (row) => formatDate(row.dataCadastro),
    },
    {
      key: 'actions',
      header: 'Acoes',
      width: '90px',
      align: 'center',
      render: (row) => (
        <div className="ct-actions">
          <button className="icon-btn" title="Editar" onClick={(e) => { e.stopPropagation(); setSelectedCliente(row); setShowEditCliente(true); }}><Edit2 size={15} /></button>
          <button className="icon-btn icon-btn--danger" title="Excluir" onClick={(e) => { e.stopPropagation(); handleDelete(row.id!); }}><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="clientes"><p>Carregando...</p></div>;
  }

  return (
    <div className="clientes">
      <div className="clientes__header">
        <h1 className="clientes__title">Clientes</h1>
        <CustomButton variant="primary" icon={<Plus size={16} />} onClick={() => setShowNewCliente(true)}>
          Novo Cliente
        </CustomButton>
      </div>

      <div className="clientes__filters">
        <div className="clientes__search">
          <CustomInput
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="clientes__counter">
        {filtered.length} cliente(s)
      </div>

      <CustomTable<Cliente>
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id!}
        emptyTitle="Nenhum cliente encontrado"
        emptyDescription='Clique em "Novo Cliente" para cadastrar'
        emptyIcon={<Users size={40} />}
      />

      <NewClienteModal open={showNewCliente} onClose={() => { setShowNewCliente(false); loadData(); }} />
      <EditClienteModal open={showEditCliente} cliente={selectedCliente} onClose={() => { setShowEditCliente(false); setSelectedCliente(null); loadData(); }} />
    </div>
  );
}
