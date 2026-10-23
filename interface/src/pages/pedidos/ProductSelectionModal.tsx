import { useState, useMemo, useRef } from 'react';
import { X, Search, ShoppingCart, Check, Package } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { type Produto, type Industria } from '../../api/client';
import { imagensDe, labelVariacao } from '../produtos/produtoUtils';
import '../pages-common.css';
import './ProductSelectionModal.css';

interface ProductSelectionModalProps {
  open: boolean;
  onClose: () => void;
  produtos: Produto[];
  industrias: Industria[];
  onAddProduct: (produto: Produto, variacao?: { tipo: string; valor: string }) => void;
  selectedCount: number;
}

export function ProductSelectionModal({
  open,
  onClose,
  produtos,
  industrias,
  onAddProduct,
  selectedCount,
}: ProductSelectionModalProps) {
  const [search, setSearch] = useState('');
  const [selectedIndustrias, setSelectedIndustrias] = useState<string[]>([]);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [selectedVariation, setSelectedVariation] = useState('');
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const flashTimer = useRef<number | undefined>(undefined);

  function addProduct(produto: Produto, variacao?: { tipo: string; valor: string }) {
    onAddProduct(produto, variacao);
    setJustAdded(produto.id ?? null);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setJustAdded(null), 900);
  }

  const productCountByIndustry = useMemo(() => {
    const counts: Record<string, number> = {};
    produtos.forEach((p) => {
      counts[p.industria] = (counts[p.industria] || 0) + 1;
    });
    return counts;
  }, [produtos]);

  const filteredProducts = useMemo(() => {
    let filtered = produtos;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((p) => p.nome.toLowerCase().includes(searchLower));
    }
    if (selectedIndustrias.length > 0) {
      filtered = filtered.filter((p) => selectedIndustrias.includes(p.industria));
    }
    return filtered;
  }, [produtos, search, selectedIndustrias]);

  if (!open) return null;

  function toggleIndustria(nome: string) {
    setSelectedIndustrias((prev) =>
      prev.includes(nome) ? prev.filter((i) => i !== nome) : [...prev, nome]
    );
  }

  function handleProductClick(produto: Produto) {
    if (produto.variacoes && produto.variacoes.length > 0) {
      setSelectedProduct(produto);
      setSelectedVariation('');
      setShowVariationModal(true);
    } else {
      addProduct(produto);
    }
  }

  function handleAddWithVariation() {
    if (!selectedVariation || !selectedProduct) return;
    const variacao = selectedProduct.variacoes?.find(
      (v) => `${v.tipo}:${v.valor}` === selectedVariation
    );
    if (variacao) {
      addProduct(selectedProduct, variacao);
    }
    setShowVariationModal(false);
    setSelectedProduct(null);
    setSelectedVariation('');
  }

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container modal-container--xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header__left">
              <Package size={20} />
              <h2 className="modal-title">Selecionar Produtos</h2>
            </div>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="modal-body ps-modal-body">
            {/* Busca */}
            <div className="ps-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filtro por industrias */}
            <div className="ps-industrias">
              <span className="ps-industrias__label">Filtrar por Industrias:</span>
              <div className="ps-industrias__chips">
                {industrias.map((ind) => (
                  <button
                    key={ind.id}
                    className={`ps-chip ${selectedIndustrias.includes(ind.nome) ? 'ps-chip--selected' : ''}`}
                    onClick={() => toggleIndustria(ind.nome)}
                  >
                    {ind.nome} ({productCountByIndustry[ind.nome] || 0})
                    {selectedIndustrias.includes(ind.nome) && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de produtos */}
            <div className="ps-produtos-list">
              {filteredProducts.length === 0 ? (
                <div className="ps-empty">
                  <Package size={40} />
                  <p>Nenhum produto encontrado</p>
                </div>
              ) : (
                filteredProducts.map((produto, i) => (
                  <div
                    key={produto.id}
                    className={`ps-produto-card item-enter ${justAdded === produto.id ? 'ps-produto-card--added' : ''}`}
                    style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
                  >
                    <div className="ps-produto-img">
                      {imagensDe(produto).length > 0 ? (
                        <img src={imagensDe(produto)[0]} alt={produto.nome} />
                      ) : (
                        <Package size={24} />
                      )}
                    </div>
                    <div className="ps-produto-info">
                      <span className="ps-produto-nome">{produto.nome}</span>
                      <span className="ps-produto-industria">{produto.industria}</span>
                      <span className="ps-produto-preco">R$ {produto.preco.toFixed(2)}</span>
                      {produto.variacoes && produto.variacoes.length > 0 && (
                        <span className="ps-produto-variacoes">
                          {produto.variacoes.length} {produto.variacoes.length > 1 ? 'variacoes' : 'variacao'}
                        </span>
                      )}
                    </div>
                    <button className="ps-produto-add" onClick={() => handleProductClick(produto)} aria-label={`Adicionar ${produto.nome}`}>
                      {justAdded === produto.id ? <Check size={18} /> : <ShoppingCart size={18} />}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Barra inferior */}
          {selectedCount > 0 && (
            <div className="ps-footer">
              <span>{selectedCount} produto(s) selecionado(s)</span>
              <CustomButton variant="primary" onClick={onClose}>Ver Pedido</CustomButton>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Variacao */}
      {showVariationModal && selectedProduct && (
        <ModalPortal>
          <div className="modal-overlay" onClick={() => setShowVariationModal(false)}>
            <div className="ps-variation-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="ps-variation-title">Selecione a Variacao</h3>

              <div className="ps-variation-preview">
                <div className="ps-variation-preview__img">
                  {imagensDe(selectedProduct).length > 0 ? (
                    <img src={imagensDe(selectedProduct)[0]} alt={selectedProduct.nome} />
                  ) : (
                    <Package size={32} />
                  )}
                </div>
                <div>
                  <span className="ps-variation-preview__name">{selectedProduct.nome}</span>
                  <span className="ps-variation-preview__price">R$ {selectedProduct.preco.toFixed(2)}</span>
                </div>
              </div>

              <span className="ps-variation-label">Escolha uma opcao:</span>
              <select
                className="ps-variation-select"
                value={selectedVariation}
                onChange={(e) => setSelectedVariation(e.target.value)}
              >
                <option value="">Selecione uma variacao...</option>
                {selectedProduct.variacoes?.map((v, i) => (
                  <option key={i} value={`${v.tipo}:${v.valor}`}>
                    {labelVariacao(v.tipo)}: {v.valor}
                  </option>
                ))}
              </select>

              <div className="ps-variation-actions">
                <CustomButton variant="ghost" onClick={() => setShowVariationModal(false)}>Cancelar</CustomButton>
                <CustomButton
                  variant="primary"
                  disabled={!selectedVariation}
                  onClick={handleAddWithVariation}
                >
                  Adicionar
                </CustomButton>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </ModalPortal>
  );
}
