import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, Users, Search, AlertCircle } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { CustomTable, type TableColumn } from '../../components/custom-table';
import { NewClienteModal } from './NewClienteModal';
import { EditClienteModal } from './EditClienteModal';
import { api, type Cliente } from '../../api/client';
import '../../styles/modal.css';
import '../pages-common.css';
import './clientes.css';
import './clientes-extra.css';

const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString('pt-BR') : '-');
const initials = (nome: string) => nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

export function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [showNewCliente, setShowNewCliente] = useState(false);
  const [showEditCliente, setShowEditCliente] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const loadData = useCallback(async () => {
    try {
      setClientes(await api.clientes.getAll());
      setLoadError('');
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clientes;
    const qDigits = q.replace(/\D/g, '');
    return clientes.filter((c) =>
      [c.nomeFantasia, c.razaoSocial, c.email, c.emailEmpresa, c.enderecoCidade].some((v) => v?.toLowerCase().includes(q)) ||
      (qDigits && [c.cnpj, c.telefone, c.telefoneEmpresa].some((v) => v?.replace(/\D/g, '').includes(qDigits)))
    );
  }, [clientes, search]);

  async function handleDelete(id: number) {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await api.clientes.delete(id);
      setClientes((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir cliente');
    }
  }

  function openEdit(row: Cliente) {
    setSelectedCliente(row);
    setShowEditCliente(true);
  }

  const columns: TableColumn<Cliente>[] = [
    {
      key: 'nomeFantasia',
      header: 'Nome',
      sortable: true,
      render: (row) => (
        <span className="cliente-cell">
          <span className="cliente-avatar">{initials(row.nomeFantasia)}</span>
          <span className="cliente-cell__text">
            <span className="ct-name">{row.nomeFantasia}</span>
            {row.razaoSocial && <small>{row.razaoSocial}</small>}
          </span>
        </span>
      ),
    },
    {
      key: 'telefoneEmpresa',
      header: 'Telefone',
      render: (row) => <span className="ct-contact"><Phone size={13} /> {row.telefoneEmpresa || row.telefone || '-'}</span>,
    },
    {
      key: 'emailEmpresa',
      header: 'Email',
      render: (row) => <span className="ct-contact"><Mail size={13} /> {row.emailEmpresa || row.email || '-'}</span>,
    },
    { key: 'enderecoCidade', header: 'Cidade', sortable: true, render: (row) => row.enderecoCidade || '-' },
    { key: 'dataCadastro', header: 'Cadastro', width: '110px', render: (row) => formatDate(row.dataCadastro) },
    {
      key: 'actions',
      header: 'Acoes',
      width: '90px',
      align: 'center',
      render: (row) => (
        <div className="ct-actions">
          <button className="icon-btn" title="Editar" aria-label="Editar" onClick={(e) => { e.stopPropagation(); openEdit(row); }}><Edit2 size={15} /></button>
          <button className="icon-btn icon-btn--danger" title="Excluir" aria-label="Excluir" onClick={(e) => { e.stopPropagation(); handleDelete(row.id!); }}><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="clientes page-enter">
      <div className="clientes__header">
        <div>
          <h1 className="clientes__title">Clientes</h1>
          <p className="clientes__subtitle">Cadastro e contatos dos seus clientes</p>
        </div>
        <CustomButton variant="primary" icon={<Plus size={16} />} onClick={() => setShowNewCliente(true)}>
          Novo Cliente
        </CustomButton>
      </div>

      <div className="clientes__filters">
        <label className="clientes__search">
          <Search size={16} />
          <input placeholder="Buscar por nome, email, CNPJ ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      {loadError && (
        <div className="order-alert" role="alert">
          <AlertCircle size={16} /> {loadError}
          <button className="clientes__retry" onClick={() => { setLoading(true); loadData(); }}>Tentar novamente</button>
        </div>
      )}

      <div className="clientes__counter">{filtered.length} cliente(s)</div>

      <CustomTable<Cliente>
        columns={columns}
        data={filtered}
        loading={loading}
        rowKey={(row) => row.id!}
        onRowClick={openEdit}
        emptyTitle="Nenhum cliente encontrado"
        emptyDescription='Clique em "Novo Cliente" para cadastrar'
        emptyIcon={<Users size={40} />}
      />

      <NewClienteModal open={showNewCliente} onClose={() => { setShowNewCliente(false); loadData(); }} />
      <EditClienteModal open={showEditCliente} cliente={selectedCliente} onClose={() => { setShowEditCliente(false); setSelectedCliente(null); loadData(); }} />
    </div>
  );
}
