import { useState, useMemo, useEffect } from 'react';
import { X, Plus, ShoppingCart, Minus, Tag, Search, Package } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { ProductSelectionModal } from './ProductSelectionModal';
import { api, type Cliente, type Produto, type Industria } from '../../api/client';
import './NewOrderModal.css';

interface ProductItem {
  id: number;
  produtoId?: number;
  nome: string;
  quantidade: number;
  preco: number;
  desconto: { tipo: 'percentual' | 'fixo'; valor: string };
}

interface NewOrderModalProps {
  open: boolean;
  onClose: () => void;
}

const METODO_PAGAMENTO = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'Pix' },
  { value: 'cartao', label: 'Cartao' },
  { value: 'boleto', label: 'Boleto' },
];

let nextProdutoId = 1;

export function NewOrderModal({ open, onClose }: NewOrderModalProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtosApi, setProdutosApi] = useState<Produto[]>([]);
  const [industrias, setIndustrias] = useState<Industria[]>([]);
  const [clienteSearch, setClienteSearch] = useState('');
  const [selectedCliente, setSelectedCliente] = useState('');
  const [produtos, setProdutos] = useState<ProductItem[]>([]);
  const [metodoPagamento, setMetodoPagamento] = useState('dinheiro');
  const [descontoGeral, setDescontoGeral] = useState<{ tipo: 'percentual' | 'fixo'; valor: string }>({ tipo: 'percentual', valor: '' });
  const [prazos, setPrazos] = useState<{ dias: string }[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [editingDiscountIndex, setEditingDiscountIndex] = useState<number | null>(null);
  const [showProductSelection, setShowProductSelection] = useState(false);

  useEffect(() => {
    if (open) {
      Promise.all([api.clientes.getAll(), api.produtos.getAll(), api.industrias.getAll()])
        .then(([c, p, i]) => { setClientes(c); setProdutosApi(p); setIndustrias(i); });
    }
  }, [open]);

  const filteredClientes = useMemo(() => {
    if (!clienteSearch.trim()) return clientes;
    return clientes.filter((c) =>
      c.nomeFantasia.toLowerCase().includes(clienteSearch.toLowerCase()) ||
      (c.razaoSocial && c.razaoSocial.toLowerCase().includes(clienteSearch.toLowerCase()))
    );
  }, [clientes, clienteSearch]);

  if (!open) return null;

  function calcularPrecoComDesconto(produto: ProductItem): number {
    const precoTotal = produto.preco * produto.quantidade;
    if (!produto.desconto.valor) return precoTotal;
    const valorDesconto = parseFloat(produto.desconto.valor.replace(',', '.')) || 0;
    const desconto = produto.desconto.tipo === 'percentual'
      ? (precoTotal * valorDesconto) / 100
      : valorDesconto;
    return Math.max(0, precoTotal - desconto);
  }

  const subtotalSemDescontos = produtos.reduce((acc, p) => acc + p.preco * p.quantidade, 0);
  const descontosIndividuais = produtos.reduce((acc, p) => acc + (p.preco * p.quantidade - calcularPrecoComDesconto(p)), 0);
  const subtotalComDescontos = subtotalSemDescontos - descontosIndividuais;

  const valorDescontoGeral = parseFloat(descontoGeral.valor.replace(',', '.')) || 0;
  const descontoGeralValor = descontoGeral.tipo === 'percentual'
    ? (subtotalComDescontos * valorDescontoGeral) / 100
    : valorDescontoGeral;
  const total = Math.max(0, subtotalComDescontos - descontoGeralValor);

  function handleAddProductFromSelection(product: Produto) {
    setProdutos((prev) => [...prev, {
      id: nextProdutoId++,
      produtoId: product.id,
      nome: product.nome,
      quantidade: 1,
      preco: product.preco,
      desconto: { tipo: 'percentual', valor: '' },
    }]);
  }

  function removeProduto(id: number) {
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  }

  function updateProdutoQuantidade(id: number, delta: number) {
    setProdutos((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const newQtd = p.quantidade + delta;
      return newQtd <= 0 ? p : { ...p, quantidade: newQtd };
    }));
  }

  function updateProdutoDesconto(id: number, tipo: 'percentual' | 'fixo', valor: string) {
    setProdutos((prev) => prev.map((p) => p.id === id ? { ...p, desconto: { tipo, valor } } : p));
  }

  function addPrazo() {
    setPrazos((prev) => [...prev, { dias: '' }]);
  }

  function removePrazo(index: number) {
    setPrazos((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePrazo(index: number, value: string) {
    setPrazos((prev) => prev.map((p, i) => i === index ? { dias: value } : p));
  }

  async function handleSave() {
    if (!selectedCliente) {
      alert('Selecione um cliente!');
      return;
    }
    if (produtos.length === 0) {
      alert('Adicione pelo menos um produto!');
      return;
    }

    try {
      await api.pedidos.create({
        cliente: selectedCliente,
        total,
        descontoTipo: descontoGeral.valor ? descontoGeral.tipo : undefined,
        descontoValor: descontoGeral.valor || undefined,
        metodoPagamento,
        observacoes: observacoes || undefined,
        produtos: produtos.map((p) => ({
          produtoId: p.produtoId,
          nome: p.nome,
          preco: p.preco,
          quantidade: p.quantidade,
          descontoTipo: p.desconto.valor ? p.desconto.tipo : undefined,
          descontoValor: p.desconto.valor || undefined,
        })),
        prazos: prazos.length > 0 ? prazos : undefined,
      });
      onClose();
    } catch {
      alert('Erro ao criar pedido');
    }
  }

  return (
    <>
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container modal-container--lg" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header__left">
              <ShoppingCart size={20} />
              <h2 className="modal-title">Novo Pedido</h2>
            </div>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="modal-body">
            {/* Selecao de Cliente */}
            <div className="form-section">
              <h3 className="form-section__title">Cliente *</h3>
              <div className="order-cliente-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Buscar cliente por nome..."
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                />
              </div>
              <div className="order-cliente-list">
                {filteredClientes.map((cliente) => (
                  <button
                    key={cliente.id}
                    className={`order-cliente-option ${selectedCliente === cliente.nomeFantasia ? 'order-cliente-option--selected' : ''}`}
                    onClick={() => {
                      setSelectedCliente(cliente.nomeFantasia);
                      setClienteSearch('');
                    }}
                  >
                    <span className="order-cliente-option__name">{cliente.nomeFantasia}</span>
                    <span className="order-cliente-option__sub">{cliente.razaoSocial}</span>
                  </button>
                ))}
              </div>
              {selectedCliente && (
                <div className="order-cliente-selected">
                  Cliente: <strong>{selectedCliente}</strong>
                  <button onClick={() => setSelectedCliente('')}><X size={14} /></button>
                </div>
              )}
            </div>

            {/* Produtos */}
            <div className="form-section">
              <div className="form-section__header">
                <h3 className="form-section__title">Produtos</h3>
              </div>

              {produtos.length === 0 ? (
                <div className="order-produtos-empty">
                  <p>Nenhum produto selecionado</p>
                </div>
              ) : (
                <div className="order-produtos-list">
                  {produtos.map((produto) => (
                    <div key={produto.id} className="order-produto-card">
                      <div className="order-produto-main">
                        <div className="order-produto-info">
                          <span className="order-produto-nome">{produto.nome}</span>
                          <span className="order-produto-preco">R$ {produto.preco.toFixed(2)}</span>
                        </div>

                        <div className="order-produto-qtd">
                          <button className="order-qtd-btn" onClick={() => updateProdutoQuantidade(produto.id, -1)}>
                            <Minus size={14} />
                          </button>
                          <span>{produto.quantidade}</span>
                          <button className="order-qtd-btn" onClick={() => updateProdutoQuantidade(produto.id, 1)}>
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="order-produto-total">
                          <span>R$ {calcularPrecoComDesconto(produto).toFixed(2)}</span>
                          <button className="order-produto-remove" onClick={() => removeProduto(produto.id)}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Desconto individual */}
                      <div className="order-produto-desconto">
                        <button
                          className="order-desconto-toggle"
                          onClick={() => setEditingDiscountIndex(editingDiscountIndex === produto.id ? null : produto.id)}
                        >
                          <Tag size={14} />
                          <span>{produto.desconto.valor ? 'Editar desconto' : 'Adicionar desconto'}</span>
                        </button>

                        {editingDiscountIndex === produto.id && (
                          <div className="order-desconto-controls">
                            <select
                              value={produto.desconto.tipo}
                              onChange={(e) => updateProdutoDesconto(produto.id, e.target.value as 'percentual' | 'fixo', produto.desconto.valor)}
                            >
                              <option value="percentual">%</option>
                              <option value="fixo">R$</option>
                            </select>
                            <input
                              type="number"
                              placeholder={produto.desconto.tipo === 'percentual' ? '0' : '0,00'}
                              value={produto.desconto.valor}
                              onChange={(e) => updateProdutoDesconto(produto.id, produto.desconto.tipo, e.target.value)}
                            />
                          </div>
                        )}

                        {produto.desconto.valor && (
                          <span className="order-desconto-aplicado">
                            Desconto: {produto.desconto.tipo === 'percentual' ? `${produto.desconto.valor}%` : `R$ ${produto.desconto.valor}`}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="order-add-produto">
                <CustomButton variant="ghost" icon={<Package size={14} />} onClick={() => setShowProductSelection(true)}>
                  Selecionar Produtos
                </CustomButton>
              </div>
            </div>

            {/* Resumo Financeiro */}
            {produtos.length > 0 && (
              <div className="order-resumo">
                <h3 className="form-section__title">Resumo</h3>
                <div className="order-resumo-line">
                  <span>Subtotal (sem descontos):</span>
                  <span>R$ {subtotalSemDescontos.toFixed(2)}</span>
                </div>
                {descontosIndividuais > 0 && (
                  <>
                    <div className="order-resumo-line">
                      <span>Descontos nos produtos:</span>
                      <span className="order-resumo--desconto">-R$ {descontosIndividuais.toFixed(2)}</span>
                    </div>
                    <div className="order-resumo-line">
                      <span>Subtotal com descontos:</span>
                      <span>R$ {subtotalComDescontos.toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className="order-resumo-desconto-geral">
                  <span>Desconto Geral no Pedido:</span>
                  <div className="order-desconto-geral-controls">
                    <select
                      value={descontoGeral.tipo}
                      onChange={(e) => setDescontoGeral((prev) => ({ ...prev, tipo: e.target.value as 'percentual' | 'fixo' }))}
                    >
                      <option value="percentual">%</option>
                      <option value="fixo">R$</option>
                    </select>
                    <input
                      type="number"
                      placeholder={descontoGeral.tipo === 'percentual' ? '0' : '0,00'}
                      value={descontoGeral.valor}
                      onChange={(e) => setDescontoGeral((prev) => ({ ...prev, valor: e.target.value }))}
                    />
                  </div>
                </div>

                {descontoGeralValor > 0 && (
                  <div className="order-resumo-line">
                    <span>Desconto geral aplicado:</span>
                    <span className="order-resumo--desconto">-R$ {descontoGeralValor.toFixed(2)}</span>
                  </div>
                )}

                <div className="order-resumo-total">
                  <span>Total Final:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Metodo de Pagamento */}
            <div className="form-section">
              <h3 className="form-section__title">Metodo de Pagamento *</h3>
              <div className="order-pagamento-options">
                {METODO_PAGAMENTO.map((metodo) => (
                  <button
                    key={metodo.value}
                    className={`order-pagamento-btn ${metodoPagamento === metodo.value ? 'order-pagamento-btn--selected' : ''}`}
                    onClick={() => {
                      setMetodoPagamento(metodo.value);
                      if (metodo.value === 'boleto') {
                        setPrazos([{ dias: '30' }]);
                      } else {
                        setPrazos([]);
                      }
                    }}
                  >
                    {metodo.label}
                  </button>
                ))}
              </div>

              {metodoPagamento === 'boleto' && (
                <div className="order-prazos">
                  <div className="order-prazos-header">
                    <span>Prazos de Pagamento (dias)</span>
                    <CustomButton variant="ghost" icon={<Plus size={14} />} onClick={addPrazo}>
                      Adicionar
                    </CustomButton>
                  </div>
                  {prazos.map((prazo, index) => (
                    <div key={index} className="order-prazo-item">
                      <input
                        type="number"
                        placeholder="Dias"
                        value={prazo.dias}
                        onChange={(e) => updatePrazo(index, e.target.value)}
                      />
                      <span>dias</span>
                      <button className="order-prazo-remove" onClick={() => removePrazo(index)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {prazos.length > 0 && (
                    <span className="order-prazos-info">Total de parcelas: {prazos.length}</span>
                  )}
                </div>
              )}
            </div>

            {/* Observacoes */}
            <div className="form-section">
              <h3 className="form-section__title">Observacoes</h3>
              <textarea
                className="form-textarea"
                placeholder="Observacoes sobre o pedido..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <CustomButton variant="ghost" onClick={onClose}>Cancelar</CustomButton>
            <CustomButton variant="primary" onClick={handleSave}>Criar Pedido</CustomButton>
          </div>
        </div>
      </div>
    </ModalPortal>

      <ProductSelectionModal
        open={showProductSelection}
        onClose={() => setShowProductSelection(false)}
        produtos={produtosApi}
        industrias={industrias}
        onAddProduct={handleAddProductFromSelection}
        selectedCount={produtos.length}
      />
    </>
  );
}
