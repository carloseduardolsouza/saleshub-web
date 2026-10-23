import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Edit2, Trash2, Package, Filter, X, Search, AlertCircle } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { NewProdutoModal } from './NewProdutoModal';
import { EditProdutoModal } from './EditProdutoModal';
import { api, type Produto } from '../../api/client';
import { imagensDe, labelVariacao } from './produtoUtils';
import '../../styles/modal.css';
import '../pages-common.css';
import './produtos.css';
import './produtos-extra.css';

const formatPrice = (preco: number) => `R$ ${preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [industrias, setIndustrias] = useState<{ id: number; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIndustria, setSelectedIndustria] = useState<string | null>(null);
  const [showNewProduto, setShowNewProduto] = useState(false);
  const [showEditProduto, setShowEditProduto] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [prodData, indData] = await Promise.all([api.produtos.getAll(), api.industrias.getAll()]);
      setProdutos(prodData);
      setIndustrias(indData.map((ind) => ({ id: ind.id!, nome: ind.nome })));
      setLoadError('');
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const countByIndustry = useMemo(() => {
    const by: Record<string, number> = {};
    produtos.forEach((p) => { by[p.industria] = (by[p.industria] || 0) + 1; });
    return by;
  }, [produtos]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return produtos.filter((p) =>
      (!selectedIndustria || p.industria === selectedIndustria) &&
      (!q || p.nome.toLowerCase().includes(q) || p.industria.toLowerCase().includes(q))
    );
  }, [produtos, search, selectedIndustria]);

  const hasActiveFilters = !!search || !!selectedIndustria;

  function openEdit(produto: Produto) {
    setSelectedProduto(produto);
    setShowEditProduto(true);
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await api.produtos.delete(id);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir produto');
    }
  }

  return (
    <div className="produtos page-enter">
      <div className="produtos__header">
        <div>
          <h1 className="produtos__title">Produtos</h1>
          <p className="produtos__subtitle">Catalogo organizado por industria</p>
        </div>
        <CustomButton variant="primary" icon={<Plus size={16} />} onClick={() => setShowNewProduto(true)}>
          Cadastrar Produto
        </CustomButton>
      </div>

      <label className="produtos__search">
        <Search size={16} />
        <input placeholder="Buscar produto..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>

      <div className="produtos__filter-section">
        <div className="produtos__filter-header">
          <Filter size={18} />
          <span>Filtrar por Industria</span>
          {selectedIndustria && (
            <button className="produtos__filter-clear" onClick={() => setSelectedIndustria(null)}>
              <X size={14} /> Limpar
            </button>
          )}
        </div>

        <div className="produtos__filter-chips">
          <button
            className={`produtos__chip ${!selectedIndustria ? 'produtos__chip--active' : ''}`}
            onClick={() => setSelectedIndustria(null)}
          >
            Todas ({produtos.length})
          </button>
          {industrias.map((ind) => (
            <button
              key={ind.id}
              className={`produtos__chip ${selectedIndustria === ind.nome ? 'produtos__chip--active' : ''}`}
              onClick={() => setSelectedIndustria(selectedIndustria === ind.nome ? null : ind.nome)}
            >
              {ind.nome} ({countByIndustry[ind.nome] || 0})
            </button>
          ))}
        </div>
      </div>

      {loadError && (
        <div className="order-alert" role="alert">
          <AlertCircle size={16} /> {loadError}
          <button className="produtos__retry" onClick={() => { setLoading(true); loadData(); }}>Tentar novamente</button>
        </div>
      )}

      <div className="produtos__counter">
        {selectedIndustria ? `${filtered.length} produto(s) - ${selectedIndustria}` : `Total: ${produtos.length} produto(s)`}
      </div>

      <div className="produtos__grid">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <div key={i} className="product-card product-card--skeleton" />)
        ) : filtered.length === 0 ? (
          <div className="produtos__empty">
            <Package size={40} />
            <p>Nenhum produto encontrado</p>
            {hasActiveFilters && (
              <CustomButton variant="ghost" onClick={() => { setSearch(''); setSelectedIndustria(null); }}>
                Limpar Filtros
              </CustomButton>
            )}
          </div>
        ) : (
          filtered.map((produto, i) => {
            const [img] = imagensDe(produto);
            return (
              <div
                key={produto.id}
                className="product-card item-enter"
                style={{ animationDelay: `${Math.min(i, 15) * 30}ms` }}
              >
                <button className="product-card__image" onClick={() => openEdit(produto)} aria-label={`Editar ${produto.nome}`}>
                  {img ? <img src={img} alt={produto.nome} loading="lazy" /> : <Package size={32} color="var(--color-text-muted)" />}
                  {!!produto.variacoes?.length && (
                    <span className="product-card__badge">
                      {produto.variacoes.length} {labelVariacao(produto.variacoes[0].tipo).toLowerCase()}
                      {produto.variacoes.length > 1 && '+'}
                    </span>
                  )}
                </button>
                <div className="product-card__body">
                  <h3 className="product-card__name">{produto.nome}</h3>
                  <span className="product-card__industry">{produto.industria}</span>
                  <div className="product-card__footer">
                    <span className="product-card__price">{formatPrice(produto.preco)}</span>
                  </div>
                </div>
                <div className="product-card__actions">
                  <button className="icon-btn" title="Editar" aria-label="Editar" onClick={() => openEdit(produto)}><Edit2 size={15} /></button>
                  <button className="icon-btn icon-btn--danger" title="Excluir" aria-label="Excluir" onClick={() => handleDelete(produto.id!)}><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <NewProdutoModal open={showNewProduto} onClose={() => { setShowNewProduto(false); loadData(); }} />
      <EditProdutoModal
        open={showEditProduto}
        produto={selectedProduto}
        onClose={() => { setShowEditProduto(false); setSelectedProduto(null); loadData(); }}
      />
    </div>
  );
}
