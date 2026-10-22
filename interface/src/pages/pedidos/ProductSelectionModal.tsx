import { useState, useMemo } from 'react';
import { X, Search, ShoppingCart, Check, Package } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { type Produto, type Industria } from '../../api/client';
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
      onAddProduct(produto);
    }
  }

  function handleAddWithVariation() {
    if (!selectedVariation || !selectedProduct) return;
    const variacao = selectedProduct.variacoes?.find(
      (v) => `${v.tipo}:${v.valor}` === selectedVariation
    );
    if (variacao) {
      onAddProduct(selectedProduct, variacao);
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
                filteredProducts.map((produto) => (
                  <div key={produto.id} className="ps-produto-card">
                    <div className="ps-produto-img">
                      {produto.imagens && produto.imagens.length > 0 ? (
                        <img src={produto.imagens[0]} alt={produto.nome} />
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
                          {produto.variacoes.length} variacao{produto.variacoes.length > 1 ? 'oes' : ''}
                        </span>
                      )}
                    </div>
                    <button className="ps-produto-add" onClick={() => handleProductClick(produto)}>
                      <ShoppingCart size={18} />
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
                  {selectedProduct.imagens && selectedProduct.imagens.length > 0 ? (
                    <img src={selectedProduct.imagens[0]} alt={selectedProduct.nome} />
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
                    {v.tipo === 'cor' ? 'Cor' : 'Tamanho'}: {v.valor}
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
