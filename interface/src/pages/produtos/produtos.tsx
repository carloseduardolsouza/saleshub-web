import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Eye, Package, Filter, X } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { CustomInput } from '../../components/custom-input';
import { NewProdutoModal } from './NewProdutoModal';
import '../../styles/modal.css';
import './Produtos.css';

interface Produto {
  id: string;
  nome: string;
  preco: string;
  industria: string;
  estoque: number;
}

const MOCK_PRODUTOS: Produto[] = [
  { id: '1', nome: 'Notebook Dell Inspiron', preco: 'R$ 4.299,00', industria: 'Dell', estoque: 12 },
  { id: '2', nome: 'iPhone 15 Pro Max', preco: 'R$ 9.499,00', industria: 'Apple', estoque: 8 },
  { id: '3', nome: 'Samsung Galaxy S24', preco: 'R$ 5.899,00', industria: 'Samsung', estoque: 15 },
  { id: '4', nome: 'Mouse Logitech MX', preco: 'R$ 459,00', industria: 'Logitech', estoque: 30 },
  { id: '5', nome: 'Teclado Mecanico Keychron', preco: 'R$ 699,00', industria: 'Keychron', estoque: 20 },
  { id: '6', nome: 'Monitor LG 27"', preco: 'R$ 1.899,00', industria: 'LG', estoque: 6 },
];

const MOCK_INDUSTRIAS = [
  { id: '1', nome: 'Dell' },
  { id: '2', nome: 'Apple' },
  { id: '3', nome: 'Samsung' },
  { id: '4', nome: 'Logitech' },
  { id: '5', nome: 'Keychron' },
  { id: '6', nome: 'LG' },
];

export function Produtos() {
  const [search, setSearch] = useState('');
  const [selectedIndustria, setSelectedIndustria] = useState<string | null>(null);
  const [showNewProduto, setShowNewProduto] = useState(false);

  const productCount = useMemo(() => {
    const byIndustry: Record<string, number> = {};
    MOCK_PRODUTOS.forEach((p) => {
      byIndustry[p.industria] = (byIndustry[p.industria] || 0) + 1;
    });
    return { total: MOCK_PRODUTOS.length, byIndustry };
  }, []);

  const filtered = useMemo(() => {
    let result = MOCK_PRODUTOS;
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
  }, [search, selectedIndustria]);

  const hasActiveFilters = search || selectedIndustria;

  function handleClearFilters() {
    setSearch('');
    setSelectedIndustria(null);
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

          {MOCK_INDUSTRIAS.map((ind) => {
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
          : `Total: ${MOCK_PRODUTOS.length} produto(s)`}
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
                  <span className="product-card__price">{produto.preco}</span>
                  <span className="product-card__stock">{produto.estoque} em estoque</span>
                </div>
              </div>
              <div className="product-card__actions">
                <button className="icon-btn" title="Detalhes"><Eye size={15} /></button>
                <button className="icon-btn" title="Editar"><Edit2 size={15} /></button>
                <button className="icon-btn icon-btn--danger" title="Excluir"><Trash2 size={15} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <NewProdutoModal open={showNewProduto} onClose={() => setShowNewProduto(false)} />
    </div>
  );
}
