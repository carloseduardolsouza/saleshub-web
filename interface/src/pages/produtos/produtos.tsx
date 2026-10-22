import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Eye, Package, Filter, X } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { CustomInput } from '../../components/custom-input';
import { NewProdutoModal } from './NewProdutoModal';
import { EditProdutoModal } from './EditProdutoModal';
import { api, type Produto } from '../../api/client';
import '../../styles/modal.css';
import './Produtos.css';

export function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [industrias, setIndustrias] = useState<{ id: number; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIndustria, setSelectedIndustria] = useState<string | null>(null);
  const [showNewProduto, setShowNewProduto] = useState(false);
  const [showEditProduto, setShowEditProduto] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  async function loadData() {
    try {
      const [prodData, indData] = await Promise.all([
        api.produtos.getAll(),
        api.industrias.getAll(),
      ]);
      setProdutos(prodData);
      setIndustrias(indData.map((ind) => ({ id: ind.id!, nome: ind.nome })));
    } catch {
      console.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, []);

  const productCount = useMemo(() => {
    const byIndustry: Record<string, number> = {};
    produtos.forEach((p) => {
      byIndustry[p.industria] = (byIndustry[p.industria] || 0) + 1;
    });
    return { total: produtos.length, byIndustry };
  }, [produtos]);

  const filtered = useMemo(() => {
    let result = produtos;
    if (selectedIndustria) {
      result = result.filter((p) => p.industria === selectedIndustria);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.nome.toLowerCase().includes(q) ||
          p.industria.toLowerCase().includes(q)
      );
    }
    return result;
  }, [produtos, search, selectedIndustria]);

  const hasActiveFilters = search || selectedIndustria;

  function handleClearFilters() {
    setSearch('');
    setSelectedIndustria(null);
  }

  function handleEditProduto(produto: Produto) {
    setSelectedProduto(produto);
    setShowEditProduto(true);
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await api.produtos.delete(id);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Erro ao excluir produto');
    }
  }

  function formatPrice(preco: number) {
    return `R$ ${preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }

  if (loading) {
    return <div className="produtos"><p>Carregando...</p></div>;
  }

  return (
    <div className="produtos">
      <div className="produtos__header">
        <h1 className="produtos__title">Produtos</h1>
        <CustomButton variant="primary" icon={<Plus size={16} />} onClick={() => setShowNewProduto(true)}>
          Cadastrar Produto
        </CustomButton>
      </div>

      <div className="produtos__search">
        <CustomInput
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="produtos__filter-section">
        <div className="produtos__filter-header">
          <Filter size={18} />
          <span>Filtrar por Industria</span>
          {selectedIndustria && (
            <button className="produtos__filter-clear" onClick={() => setSelectedIndustria(null)}>
              <X size={14} />
              Limpar
            </button>
          )}
        </div>

        <div className="produtos__filter-chips">
          <button
            className={`produtos__chip ${!selectedIndustria ? 'produtos__chip--active' : ''}`}
            onClick={() => setSelectedIndustria(null)}
          >
            Todas ({productCount.total})
          </button>

          {industrias.map((ind) => {
            const count = productCount.byIndustry[ind.nome] || 0;
            const isSelected = selectedIndustria === ind.nome;
            return (
              <button
                key={ind.id}
                className={`produtos__chip ${isSelected ? 'produtos__chip--active' : ''}`}
                onClick={() => setSelectedIndustria(ind.nome)}
              >
                {ind.nome} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="produtos__counter">
        {selectedIndustria
          ? `${filtered.length} produto(s) - ${selectedIndustria}`
          : `Total: ${produtos.length} produto(s)`}
      </div>

      <div className="produtos__grid">
        {filtered.length === 0 ? (
          <div className="produtos__empty">
            <Package size={40} />
            <p>Nenhum produto encontrado</p>
            {hasActiveFilters && (
              <CustomButton variant="ghost" onClick={handleClearFilters}>
                Limpar Filtros
              </CustomButton>
            )}
          </div>
        ) : (
          filtered.map((produto) => (
            <div key={produto.id} className="product-card">
              <div className="product-card__image">
                <Package size={32} color="var(--color-text-muted)" />
              </div>
              <div className="product-card__body">
                <h3 className="product-card__name">{produto.nome}</h3>
                <span className="product-card__industry">{produto.industria}</span>
                <div className="product-card__footer">
                  <span className="product-card__price">{formatPrice(produto.preco)}</span>
                </div>
              </div>
              <div className="product-card__actions">
                <button className="icon-btn" title="Detalhes"><Eye size={15} /></button>
                <button className="icon-btn" title="Editar" onClick={() => handleEditProduto(produto)}><Edit2 size={15} /></button>
                <button className="icon-btn icon-btn--danger" title="Excluir" onClick={() => handleDelete(produto.id!)}><Trash2 size={15} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <NewProdutoModal open={showNewProduto} onClose={() => { setShowNewProduto(false); loadData(); }} />
      <EditProdutoModal open={showEditProduto} produto={selectedProduto} onClose={() => { setShowEditProduto(false); setSelectedProduto(null); loadData(); }} />
    </div>
  );
}
