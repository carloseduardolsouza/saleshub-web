import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Building, Phone, Mail, Filter, Check } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { CustomInput } from '../../components/custom-input';
import { CustomTable, type TableColumn } from '../../components/custom-table';
import { NewIndustriaModal } from './NewIndustriaModal';
import { EditIndustriaModal } from './EditIndustriaModal';
import { DetailsIndustriaModal } from './DetailsIndustriaModal';
import '../../styles/modal.css';
import './Industrias.css';

interface Industria {
  id: string;
  cnpj: string;
  nome: string;
  telefoneComercial: string;
  telefoneAssistencia: string;
  email: string;
  dataCadastro: string;
  dataEdicao?: string;
}

const AVAILABLE_FIELDS = [
  { key: 'nome', label: 'Nome da Industria' },
  { key: 'cnpj', label: 'CNPJ' },
  { key: 'telefoneComercial', label: 'Telefone Comercial' },
  { key: 'telefoneAssistencia', label: 'Telefone Assistencia' },
  { key: 'email', label: 'Email' },
] as const;

const MOCK_INDUSTRIAS: Industria[] = [
  { id: '1', cnpj: '11.222.333/0001-44', nome: 'Samsung Electronics', telefoneComercial: '(11) 3456-7890', telefoneAssistencia: '(11) 3456-7891', email: 'contato@samsung.com.br', dataCadastro: '10/01/2026' },
  { id: '2', cnpj: '22.333.444/0001-55', nome: 'Apple Inc.', telefoneComercial: '(11) 2345-6789', telefoneAssistencia: '', email: 'suporte@apple.com.br', dataCadastro: '15/02/2026' },
  { id: '3', cnpj: '33.444.555/0001-66', nome: 'LG Electronics', telefoneComercial: '(11) 4567-8901', telefoneAssistencia: '(11) 4567-8902', email: 'contato@lg.com.br', dataCadastro: '01/03/2026' },
  { id: '4', cnpj: '44.555.666/0001-77', nome: 'Sony Mobile', telefoneComercial: '(11) 5678-9012', telefoneAssistencia: '', email: 'vendas@sony.com.br', dataCadastro: '20/04/2026' },
  { id: '5', cnpj: '55.666.777/0001-88', nome: 'Motorola Mobility', telefoneComercial: '(11) 6789-0123', telefoneAssistencia: '(11) 6789-0124', email: 'contato@motorola.com.br', dataCadastro: '05/05/2026' },
  { id: '6', cnpj: '66.777.888/0001-99', nome: 'Xiaomi Technology', telefoneComercial: '(11) 7890-1234', telefoneAssistencia: '', email: 'suporte@xiaomi.com.br', dataCadastro: '01/06/2026' },
];

function renderField(value: string | undefined, fieldKey: string): React.ReactNode {
  if (!value) return <span className="ct-td--muted">-</span>;
  if (fieldKey === 'nome') return <span className="ct-name">{value}</span>;
  if (fieldKey === 'telefoneComercial' || fieldKey === 'telefoneAssistencia') {
    return <span className="ct-contact"><Phone size={13} /> {value}</span>;
  }
  if (fieldKey === 'email') {
    return <span className="ct-contact"><Mail size={13} /> {value}</span>;
  }
  return value;
}

export function Industrias() {
  const [search, setSearch] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>(['nome', 'cnpj', 'telefoneComercial']);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIndustria, setSelectedIndustria] = useState<Industria | null>(null);

  function isCNPJ(text: string): boolean {
    const cleanText = text.replace(/\D/g, '');
    return cleanText.length >= 11 && /^\d+$/.test(cleanText);
  }

  const filtered = MOCK_INDUSTRIAS.filter((industria) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase().trim();
    if (isCNPJ(search)) {
      const cnpjNumbers = industria.cnpj.replace(/\D/g, '');
      const searchNumbers = search.replace(/\D/g, '');
      return cnpjNumbers.includes(searchNumbers);
    }
    return industria.nome.toLowerCase().includes(searchLower);
  });

  function toggleField(fieldKey: string) {
    if (selectedFields.includes(fieldKey)) {
      if (selectedFields.length > 1) {
        setSelectedFields(selectedFields.filter((f) => f !== fieldKey));
      }
    } else {
      setSelectedFields([...selectedFields, fieldKey]);
    }
  }

  function handleViewDetails(industria: Industria) {
    setSelectedIndustria(industria);
    setShowDetailsModal(true);
  }

  function handleEdit(industria: Industria) {
    setSelectedIndustria(industria);
    setShowDetailsModal(false);
    setShowEditModal(true);
  }

  function handleDelete(industria: Industria) {
    if (window.confirm(`Tem certeza que deseja excluir "${industria.nome}"?`)) {
      alert(`Industria "${industria.nome}" excluida com sucesso!`);
    }
  }

  const columns = useMemo<TableColumn<Industria>[]>(() => {
    const fieldCols: TableColumn<Industria>[] = selectedFields.map((fieldKey) => {
      const field = AVAILABLE_FIELDS.find((f) => f.key === fieldKey);
      return {
        key: fieldKey,
        header: field?.label ?? fieldKey,
        width: fieldKey === 'cnpj' ? '160px' : undefined,
        sortable: fieldKey === 'nome',
        render: (row) => renderField(row[fieldKey as keyof Industria] as string, fieldKey),
      };
    });

    return [
      ...fieldCols,
      {
        key: 'actions',
        header: 'Acoes',
        width: '90px',
        align: 'center' as const,
        render: (row) => (
          <div className="ct-actions" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" title="Editar" onClick={() => handleEdit(row)}>
              <Edit2 size={15} />
            </button>
            <button className="icon-btn icon-btn--danger" title="Excluir" onClick={() => handleDelete(row)}>
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ];
  }, [selectedFields]);

  return (
    <div className="industrias">
      <div className="industrias__header">
        <h1 className="industrias__title">Industrias</h1>
        <CustomButton variant="primary" icon={<Plus size={16} />} onClick={() => setShowNewModal(true)}>
          Nova Industria
        </CustomButton>
      </div>

      <div className="industrias__filters">
        <div className="industrias__search">
          <CustomInput
            placeholder="Buscar por nome ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="icon-btn" title="Filtrar colunas" onClick={() => setShowFilterModal(true)}>
          <Filter size={16} />
        </button>
      </div>

      <div className="industrias__counter">
        {filtered.length} industria(s) encontrada(s)
      </div>

      <CustomTable<Industria>
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        rowKey={(row) => row.id}
        emptyTitle="Nenhuma industria encontrada"
        emptyDescription='Clique em "Nova Industria" para cadastrar'
        emptyIcon={<Building size={40} />}
        onRowClick={(row) => handleViewDetails(row)}
      />

      {showFilterModal && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header__left">
                <h2 className="modal-title">Selecionar Colunas</h2>
              </div>
              <button className="modal-close" onClick={() => setShowFilterModal(false)}>
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>Fechar</span>
              </button>
            </div>
            <div className="modal-body">
              {AVAILABLE_FIELDS.map((field) => (
                <label key={field.key} className="industrias__field-option" onClick={() => toggleField(field.key)}>
                  <span className="industrias__field-label">{field.label}</span>
                  <div className={`industrias__checkbox ${selectedFields.includes(field.key) ? 'industrias__checkbox--selected' : ''}`}>
                    {selectedFields.includes(field.key) && <Check size={14} />}
                  </div>
                </label>
              ))}
              <p className="industrias__field-count">
                {selectedFields.length} de {AVAILABLE_FIELDS.length} colunas selecionadas
              </p>
            </div>
          </div>
        </div>
      )}

      <NewIndustriaModal open={showNewModal} onClose={() => setShowNewModal(false)} />
      <EditIndustriaModal open={showEditModal} industria={selectedIndustria} onClose={() => setShowEditModal(false)} />
      <DetailsIndustriaModal
        open={showDetailsModal}
        industria={selectedIndustria}
        onClose={() => setShowDetailsModal(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
