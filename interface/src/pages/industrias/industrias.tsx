import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit2, Trash2, Building, Phone, Mail, Filter, Check, Search, X, AlertCircle } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { CustomTable, type TableColumn } from '../../components/custom-table';
import { NewIndustriaModal } from './NewIndustriaModal';
import { EditIndustriaModal } from './EditIndustriaModal';
import { DetailsIndustriaModal } from './DetailsIndustriaModal';
import { api, type Industria } from '../../api/client';
import '../../styles/modal.css';
import '../pages-common.css';
import './industrias.css';
import './industrias-extra.css';

const AVAILABLE_FIELDS = [
  { key: 'nome', label: 'Nome da Industria' },
  { key: 'cnpj', label: 'CNPJ' },
  { key: 'telefoneComercial', label: 'Telefone Comercial' },
  { key: 'telefoneAssistencia', label: 'Telefone Assistencia' },
  { key: 'email', label: 'Email' },
] as const;

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
  const [industrias, setIndustrias] = useState<Industria[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>(['nome', 'cnpj', 'telefoneComercial']);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIndustria, setSelectedIndustria] = useState<Industria | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIndustrias(await api.industrias.getAll());
      setLoadError('');
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Erro ao carregar industrias');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const qDigits = q.replace(/\D/g, '');
    if (!q) return industrias;
    return industrias.filter((i) =>
      i.nome.toLowerCase().includes(q) || (qDigits.length > 0 && i.cnpj.replace(/\D/g, '').includes(qDigits))
    );
  }, [industrias, search]);

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

  async function handleDelete(industria: Industria) {
    if (!window.confirm(`Tem certeza que deseja excluir "${industria.nome}"?`)) return;
    try {
      await api.industrias.delete(industria.id!);
      setIndustrias((prev) => prev.filter((i) => i.id !== industria.id));
      setShowDetailsModal(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir industria');
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
            <button className="icon-btn" title="Editar" aria-label="Editar" onClick={() => handleEdit(row)}>
              <Edit2 size={15} />
            </button>
            <button className="icon-btn icon-btn--danger" title="Excluir" aria-label="Excluir" onClick={() => handleDelete(row)}>
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ];
  }, [selectedFields]);

  return (
    <div className="industrias page-enter">
      <div className="industrias__header">
        <div>
          <h1 className="industrias__title">Industrias</h1>
          <p className="industrias__subtitle">Fabricantes e fornecedores dos seus produtos</p>
        </div>
        <CustomButton variant="primary" icon={<Plus size={16} />} onClick={() => setShowNewModal(true)}>
          Nova Industria
        </CustomButton>
      </div>

      <div className="industrias__filters">
        <label className="industrias__search">
          <Search size={16} />
          <input placeholder="Buscar por nome ou CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <button className="icon-btn" title="Filtrar colunas" aria-label="Filtrar colunas" onClick={() => setShowFilterModal(true)}>
          <Filter size={16} />
        </button>
      </div>

      {loadError && (
        <div className="order-alert" role="alert">
          <AlertCircle size={16} /> {loadError}
          <button className="industrias__retry" onClick={() => { setLoading(true); loadData(); }}>Tentar novamente</button>
        </div>
      )}

      <div className="industrias__counter">
        {filtered.length} industria(s) encontrada(s)
      </div>

      <CustomTable<Industria>
        columns={columns}
        data={filtered}
        loading={loading}
        rowKey={(row) => row.id!}
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
              <button className="modal-close" onClick={() => setShowFilterModal(false)} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {AVAILABLE_FIELDS.map((field) => (
                <button type="button" key={field.key} className="industrias__field-option" onClick={() => toggleField(field.key)} role="checkbox" aria-checked={selectedFields.includes(field.key)}>
                  <span className="industrias__field-label">{field.label}</span>
                  <div className={`industrias__checkbox ${selectedFields.includes(field.key) ? 'industrias__checkbox--selected' : ''}`}>
                    {selectedFields.includes(field.key) && <Check size={14} />}
                  </div>
                </button>
              ))}
              <p className="industrias__field-count">
                {selectedFields.length} de {AVAILABLE_FIELDS.length} colunas selecionadas
              </p>
            </div>
          </div>
        </div>
      )}

      <NewIndustriaModal open={showNewModal} onClose={() => { setShowNewModal(false); loadData(); }} />
      <EditIndustriaModal open={showEditModal} industria={selectedIndustria} onClose={() => { setShowEditModal(false); setSelectedIndustria(null); loadData(); }} />
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
