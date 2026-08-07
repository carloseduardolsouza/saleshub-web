import { useState } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, Users } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { CustomInput } from '../../components/custom-input';
import { CustomTable, type TableColumn } from '../../components/custom-table';
import { NewClienteModal } from './NewClienteModal';
import '../../styles/modal.css';
import './Clientes.css';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
  dataCadastro: string;
}

const MOCK_CLIENTES: Cliente[] = [
  { id: '1', nome: 'Maria Silva', telefone: '(11) 99876-5432', email: 'maria@email.com', cidade: 'Sao Paulo', dataCadastro: '01/06/2026' },
  { id: '2', nome: 'Joao Santos', telefone: '(21) 98765-4321', email: 'joao@email.com', cidade: 'Rio de Janeiro', dataCadastro: '15/05/2026' },
  { id: '3', nome: 'Ana Oliveira', telefone: '(31) 97654-3210', email: 'ana@email.com', cidade: 'Belo Horizonte', dataCadastro: '20/04/2026' },
  { id: '4', nome: 'Carlos Souza', telefone: '(41) 96543-2109', email: 'carlos@email.com', cidade: 'Curitiba', dataCadastro: '10/03/2026' },
  { id: '5', nome: 'Lucia Ferreira', telefone: '(51) 95432-1098', email: 'lucia@email.com', cidade: 'Porto Alegre', dataCadastro: '05/02/2026' },
  { id: '6', nome: 'Pedro Lima', telefone: '(61) 94321-0987', email: 'pedro@email.com', cidade: 'Brasilia', dataCadastro: '01/01/2026' },
];

const columns: TableColumn<Cliente>[] = [
  {
    key: 'nome',
    header: 'Nome',
    sortable: true,
    render: (row) => <span className="ct-name">{row.nome}</span>,
  },
  {
    key: 'telefone',
    header: 'Telefone',
    render: (row) => (
      <span className="ct-contact"><Phone size={13} /> {row.telefone}</span>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (row) => (
      <span className="ct-contact"><Mail size={13} /> {row.email}</span>
    ),
  },
  { key: 'cidade', header: 'Cidade', sortable: true },
  { key: 'dataCadastro', header: 'Cadastro', width: '110px' },
  {
    key: 'actions',
    header: 'Acoes',
    width: '90px',
    align: 'center',
    render: () => (
      <div className="ct-actions">
        <button className="icon-btn" title="Editar"><Edit2 size={15} /></button>
        <button className="icon-btn icon-btn--danger" title="Excluir"><Trash2 size={15} /></button>
      </div>
    ),
  },
];

export function Clientes() {
  const [search, setSearch] = useState('');
  const [showNewCliente, setShowNewCliente] = useState(false);

  const filtered = MOCK_CLIENTES.filter((c) => {
    return !search || c.nome.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
  });

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
        data={filtered as unknown as Record<string, unknown>[]}
        rowKey={(row) => row.id}
        emptyTitle="Nenhum cliente encontrado"
        emptyDescription='Clique em "Novo Cliente" para cadastrar'
        emptyIcon={<Users size={40} />}
      />

      <NewClienteModal open={showNewCliente} onClose={() => setShowNewCliente(false)} />
    </div>
  );
}
