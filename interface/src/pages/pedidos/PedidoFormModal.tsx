import { useState, useMemo, useEffect } from 'react';
import { X, Plus, ShoppingCart, Minus, Tag, Search, Package, Edit2, AlertCircle } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { ProductSelectionModal } from './ProductSelectionModal';
import { api, type Pedido, type Cliente, type Produto, type Industria } from '../../api/client';
import { METODO_PAGAMENTO, formatBRL, parseDecimal, valorDesconto } from './pedidoUtils';
import './NewOrderModal.css';

type DescontoTipo = 'percentual' | 'fixo';
interface Desconto { tipo: DescontoTipo; valor: string }

interface ProductItem {
  id: number;
  produtoId?: number;
  nome: string;
  quantidade: number;
  preco: number;
  desconto: Desconto;
  variacaoTipo?: string;
  variacaoValor?: string;
}

let nextProdutoId = 1;

const toDesconto = (tipo?: string, valor?: string): Desconto => ({
  tipo: tipo === 'fixo' ? 'fixo' : 'percentual',
  valor: valor || '',
});

interface Props {
  pedido?: Pedido | null;
  onClose: () => void;
}

// Montado só enquanto aberto (ver wrappers), então o estado inicial vem sempre do pedido.
export function PedidoFormModal({ pedido, onClose }: Props) {
  const isEdit = !!pedido?.id;
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtosApi, setProdutosApi] = useState<Produto[]>([]);
  const [industrias, setIndustrias] = useState<Industria[]>([]);
  const [clienteSearch, setClienteSearch] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(pedido?.cliente ?? '');
  const [produtos, setProdutos] = useState<ProductItem[]>(() =>
    (pedido?.produtos ?? []).map((p) => ({
      id: nextProdutoId++,
      produtoId: p.produtoId ?? undefined,
      nome: p.nome,
      quantidade: p.quantidade,
      preco: p.preco,
      desconto: toDesconto(p.descontoTipo, p.descontoValor),
      variacaoTipo: p.variacaoTipo ?? undefined,
      variacaoValor: p.variacaoValor ?? undefined,
    }))
  );
  const [metodoPagamento, setMetodoPagamento] = useState(pedido?.metodoPagamento || 'dinheiro');
  const [descontoGeral, setDescontoGeral] = useState<Desconto>(toDesconto(pedido?.descontoTipo, pedido?.descontoValor));
  const [prazos, setPrazos] = useState<{ dias: string }[]>(() => (pedido?.prazos ?? []).map((p) => ({ dias: p.dias })));
  const [observacoes, setObservacoes] = useState(pedido?.observacoes ?? '');
  const [editingDiscountId, setEditingDiscountId] = useState<number | null>(null);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.clientes.getAll(), api.produtos.getAll(), api.industrias.getAll()])
      .then(([c, p, i]) => {
        if (cancelled) return;
        setClientes(c); setProdutosApi(p); setIndustrias(i);
      })
      .catch(() => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !showProductSelection) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, showProductSelection]);

  const filteredClientes = useMemo(() => {
    const q = clienteSearch.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter((c) =>
      c.nomeFantasia.toLowerCase().includes(q) || c.razaoSocial?.toLowerCase().includes(q)
    );
  }, [clientes, clienteSearch]);

  const linhaTotal = (p: ProductItem) => {
    const base = p.preco * p.quantidade;
    return base - valorDesconto(base, p.desconto.tipo, p.desconto.valor);
  };

  const subtotalSemDescontos = produtos.reduce((acc, p) => acc + p.preco * p.quantidade, 0);
  const subtotalComDescontos = produtos.reduce((acc, p) => acc + linhaTotal(p), 0);
  const descontosIndividuais = subtotalSemDescontos - subtotalComDescontos;
  const descontoGeralValor = valorDesconto(subtotalComDescontos, descontoGeral.tipo, descontoGeral.valor);
  const total = Math.round((subtotalComDescontos - descontoGeralValor) * 100) / 100;

  function handleAddProduct(product: Produto, variacao?: { tipo: string; valor: string }) {
    setProdutos((prev) => {
      const same = prev.find((p) =>
        p.produtoId === product.id && p.variacaoTipo === variacao?.tipo && p.variacaoValor === variacao?.valor
      );
      if (same) return prev.map((p) => p === same ? { ...p, quantidade: p.quantidade + 1 } : p);
      return [...prev, {
        id: nextProdutoId++,
        produtoId: product.id,
        nome: product.nome,
        quantidade: 1,
        preco: product.preco,
        desconto: { tipo: 'percentual', valor: '' },
        variacaoTipo: variacao?.tipo,
        variacaoValor: variacao?.valor,
      }];
    });
  }

  const updateProduto = (id: number, patch: Partial<ProductItem>) =>
    setProdutos((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));

  const changeQtd = (p: ProductItem, delta: number) =>
    updateProduto(p.id, { quantidade: Math.max(1, p.quantidade + delta) });

  function selectMetodo(value: string) {
    setMetodoPagamento(value);
    if (value !== 'boleto') setPrazos([]);
    else if (prazos.length === 0) setPrazos([{ dias: '30' }]);
  }

  async function handleSave() {
    setError('');
    if (!selectedCliente) return setError('Selecione um cliente.');
    if (produtos.length === 0) return setError('Adicione pelo menos um produto.');
    if (metodoPagamento === 'boleto') {
      if (prazos.length === 0 || prazos.some((p) => !(parseInt(p.dias, 10) > 0))) {
        return setError('Informe os dias de cada parcela do boleto.');
      }
    }

    const payload: Pedido = {
      cliente: selectedCliente,
      total,
      descontoTipo: descontoGeral.valor ? descontoGeral.tipo : undefined,
      descontoValor: descontoGeral.valor || undefined,
      metodoPagamento,
      observacoes: observacoes.trim() || undefined,
      status: pedido?.status,
      produtos: produtos.map((p) => ({
        produtoId: p.produtoId,
        nome: p.nome,
        preco: p.preco,
        quantidade: p.quantidade,
        descontoTipo: p.desconto.valor ? p.desconto.tipo : undefined,
        descontoValor: p.desconto.valor || undefined,
        variacaoTipo: p.variacaoTipo,
        variacaoValor: p.variacaoValor,
      })),
      prazos: metodoPagamento === 'boleto' ? prazos.map((p) => ({ dias: String(parseInt(p.dias, 10)) })) : [],
    };

    setSaving(true);
    try {
      if (isEdit) await api.pedidos.update(pedido!.id!, payload);
      else await api.pedidos.create(payload);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar pedido');
      setSaving(false);
    }
  }

  return (
    <>
      <ModalPortal>
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-container modal-container--lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header__left">
                {isEdit ? <Edit2 size={20} /> : <ShoppingCart size={20} />}
                <h2 className="modal-title">{isEdit ? `Editar Pedido #${pedido!.id}` : 'Novo Pedido'}</h2>
              </div>
              <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
            </div>

            <div className="modal-body">
              {loadError && (
                <div className="order-alert"><AlertCircle size={16} /> Nao foi possivel carregar clientes e produtos.</div>
              )}

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
                  {filteredClientes.length === 0 && <div className="order-cliente-empty">Nenhum cliente encontrado</div>}
                  {filteredClientes.map((cliente) => (
                    <button
                      type="button"
                      key={cliente.id}
                      className={`order-cliente-option ${selectedCliente === cliente.nomeFantasia ? 'order-cliente-option--selected' : ''}`}
                      onClick={() => { setSelectedCliente(cliente.nomeFantasia); setClienteSearch(''); }}
                    >
                      <span className="order-cliente-option__name">{cliente.nomeFantasia}</span>
                      <span className="order-cliente-option__sub">{cliente.razaoSocial}</span>
                    </button>
                  ))}
                </div>
                {selectedCliente && (
                  <div className="order-cliente-selected">
                    <span>Cliente: <strong>{selectedCliente}</strong></span>
                    <button type="button" onClick={() => setSelectedCliente('')} aria-label="Remover cliente"><X size={14} /></button>
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3 className="form-section__title">Produtos</h3>

                {produtos.length === 0 ? (
                  <div className="order-produtos-empty"><p>Nenhum produto selecionado</p></div>
                ) : (
                  <div className="order-produtos-list">
                    {produtos.map((produto) => (
                      <div key={produto.id} className="order-produto-card">
                        <div className="order-produto-main">
                          <div className="order-produto-info">
                            <span className="order-produto-nome">{produto.nome}</span>
                            {produto.variacaoValor && (
                              <span className="order-produto-variacao">
                                {produto.variacaoTipo === 'cor' ? 'Cor' : 'Tam'}: {produto.variacaoValor}
                              </span>
                            )}
                            <span className="order-produto-preco">{formatBRL(produto.preco)}</span>
                          </div>

                          <div className="order-produto-qtd">
                            <button type="button" className="order-qtd-btn" onClick={() => changeQtd(produto, -1)} disabled={produto.quantidade <= 1} aria-label="Diminuir">
                              <Minus size={14} />
                            </button>
                            <span>{produto.quantidade}</span>
                            <button type="button" className="order-qtd-btn" onClick={() => changeQtd(produto, 1)} aria-label="Aumentar">
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="order-produto-total">
                            <span>{formatBRL(linhaTotal(produto))}</span>
                            <button type="button" className="order-produto-remove" onClick={() => setProdutos((prev) => prev.filter((p) => p.id !== produto.id))} aria-label="Remover produto">
                              <X size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="order-produto-desconto">
                          <button
                            type="button"
                            className="order-desconto-toggle"
                            onClick={() => setEditingDiscountId(editingDiscountId === produto.id ? null : produto.id)}
                          >
                            <Tag size={14} />
                            <span>{produto.desconto.valor ? 'Editar desconto' : 'Adicionar desconto'}</span>
                          </button>

                          {editingDiscountId === produto.id && (
                            <div className="order-desconto-controls">
                              <select
                                value={produto.desconto.tipo}
                                onChange={(e) => updateProduto(produto.id, { desconto: { ...produto.desconto, tipo: e.target.value as DescontoTipo } })}
                              >
                                <option value="percentual">%</option>
                                <option value="fixo">R$</option>
                              </select>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder={produto.desconto.tipo === 'percentual' ? '0' : '0,00'}
                                value={produto.desconto.valor}
                                onChange={(e) => updateProduto(produto.id, { desconto: { ...produto.desconto, valor: e.target.value } })}
                              />
                            </div>
                          )}

                          {produto.desconto.valor && parseDecimal(produto.desconto.valor) > 0 && (
                            <span className="order-desconto-aplicado">
                              Desconto: {produto.desconto.tipo === 'percentual' ? `${produto.desconto.valor}%` : formatBRL(parseDecimal(produto.desconto.valor))}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="order-add-produto">
                  <CustomButton type="button" variant="ghost" icon={<Package size={14} />} onClick={() => setShowProductSelection(true)}>
                    Selecionar Produtos
                  </CustomButton>
                </div>
              </div>

              {produtos.length > 0 && (
                <div className="order-resumo">
                  <h3 className="form-section__title">Resumo</h3>
                  <div className="order-resumo-line">
                    <span>Subtotal (sem descontos):</span>
                    <span>{formatBRL(subtotalSemDescontos)}</span>
                  </div>
                  {descontosIndividuais > 0 && (
                    <>
                      <div className="order-resumo-line">
                        <span>Descontos nos produtos:</span>
                        <span className="order-resumo--desconto">-{formatBRL(descontosIndividuais)}</span>
                      </div>
                      <div className="order-resumo-line">
                        <span>Subtotal com descontos:</span>
                        <span>{formatBRL(subtotalComDescontos)}</span>
                      </div>
                    </>
                  )}

                  <div className="order-resumo-desconto-geral">
                    <span>Desconto Geral no Pedido:</span>
                    <div className="order-desconto-geral-controls">
                      <select
                        value={descontoGeral.tipo}
                        onChange={(e) => setDescontoGeral((prev) => ({ ...prev, tipo: e.target.value as DescontoTipo }))}
                      >
                        <option value="percentual">%</option>
                        <option value="fixo">R$</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={descontoGeral.tipo === 'percentual' ? '0' : '0,00'}
                        value={descontoGeral.valor}
                        onChange={(e) => setDescontoGeral((prev) => ({ ...prev, valor: e.target.value }))}
                      />
                    </div>
                  </div>

                  {descontoGeralValor > 0 && (
                    <div className="order-resumo-line">
                      <span>Desconto geral aplicado:</span>
                      <span className="order-resumo--desconto">-{formatBRL(descontoGeralValor)}</span>
                    </div>
                  )}

                  <div className="order-resumo-total">
                    <span>Total Final:</span>
                    <span>{formatBRL(total)}</span>
                  </div>
                </div>
              )}

              <div className="form-section">
                <h3 className="form-section__title">Metodo de Pagamento *</h3>
                <div className="order-pagamento-options">
                  {METODO_PAGAMENTO.map((metodo) => (
                    <button
                      type="button"
                      key={metodo.value}
                      className={`order-pagamento-btn ${metodoPagamento === metodo.value ? 'order-pagamento-btn--selected' : ''}`}
                      onClick={() => selectMetodo(metodo.value)}
                    >
                      {metodo.label}
                    </button>
                  ))}
                </div>

                {metodoPagamento === 'boleto' && (
                  <div className="order-prazos">
                    <div className="order-prazos-header">
                      <span>Prazos de Pagamento (dias)</span>
                      <CustomButton type="button" variant="ghost" icon={<Plus size={14} />} onClick={() => setPrazos((prev) => [...prev, { dias: '' }])}>
                        Adicionar
                      </CustomButton>
                    </div>
                    {prazos.map((prazo, index) => (
                      <div key={index} className="order-prazo-item">
                        <input
                          type="number"
                          min="1"
                          placeholder="Dias"
                          value={prazo.dias}
                          onChange={(e) => setPrazos((prev) => prev.map((p, i) => i === index ? { dias: e.target.value } : p))}
                        />
                        <span>dias</span>
                        <button type="button" className="order-prazo-remove" onClick={() => setPrazos((prev) => prev.filter((_, i) => i !== index))} aria-label="Remover parcela">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {prazos.length > 0 && <span className="order-prazos-info">Total de parcelas: {prazos.length}</span>}
                  </div>
                )}
              </div>

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
              {error ? <span className="order-error" role="alert"><AlertCircle size={14} /> {error}</span> : <span />}
              <div className="modal-footer__actions">
                <CustomButton variant="ghost" onClick={onClose} disabled={saving}>Cancelar</CustomButton>
                <CustomButton variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Salvando...' : isEdit ? 'Salvar Alteracoes' : 'Criar Pedido'}
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      </ModalPortal>

      <ProductSelectionModal
        open={showProductSelection}
        onClose={() => setShowProductSelection(false)}
        produtos={produtosApi}
        industrias={industrias}
        onAddProduct={handleAddProduct}
        selectedCount={produtos.length}
      />
    </>
  );
}
