import { useState } from 'react';
import { X, Eye, Trash2, Tag, FileDown, AlertCircle } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { api, type Pedido } from '../../api/client';
import { STATUS_PEDIDO, formatBRL, formatDescontoLabel, labelMetodo } from './pedidoUtils';

interface DetailsPedidoModalProps {
  open: boolean;
  pedido: Pedido | null;
  onClose: () => void;
  onDelete: (id: number) => Promise<boolean>;
  onStatusChange: (pedido: Pedido) => void;
}

export function DetailsPedidoModal({ open, pedido, onClose, onDelete, onStatusChange }: DetailsPedidoModalProps) {
  const [exporting, setExporting] = useState<'com' | 'sem' | null>(null);
  const [error, setError] = useState('');

  if (!open || !pedido) return null;

  const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString('pt-BR') : '-');

  async function handleExportPDF(mostrarDescontos: boolean) {
    if (!pedido?.id) return;
    setError('');
    setExporting(mostrarDescontos ? 'com' : 'sem');
    try {
      await api.pedidos.downloadPDF(pedido.id, mostrarDescontos);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao gerar PDF');
    } finally {
      setExporting(null);
    }
  }

  async function handleStatus(status: string) {
    if (!pedido?.id) return;
    setError('');
    try {
      const updated = await api.pedidos.updateStatus(pedido.id, status);
      onStatusChange(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar status');
    }
  }

  async function handleDelete() {
    if (await onDelete(pedido!.id!)) onClose();
  }

  const status = pedido.status || 'pendente';

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container modal-container--lg" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header__left">
              <Eye size={20} />
              <h2 className="modal-title">Detalhes do Pedido #{pedido.id}</h2>
            </div>
            <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
          </div>

          <div className="modal-body">
            <div className="form-section">
              <h3 className="form-section__title">Informacoes Gerais</h3>
              <div className="details-grid">
                <div className="details-item">
                  <span className="details-item__label">Cliente</span>
                  <span className="details-item__value">{pedido.cliente}</span>
                </div>
                <div className="details-item">
                  <span className="details-item__label">Data</span>
                  <span className="details-item__value">{formatDate(pedido.data)}</span>
                </div>
                <div className="details-item">
                  <span className="details-item__label">Pagamento</span>
                  <span className="details-item__value">{labelMetodo(pedido.metodoPagamento)}</span>
                </div>
                <div className="details-item">
                  <span className="details-item__label">Status</span>
                  <select
                    className={`status-select status-badge--${status}`}
                    value={status}
                    onChange={(e) => handleStatus(e.target.value)}
                    aria-label="Status do pedido"
                  >
                    {STATUS_PEDIDO.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {pedido.produtos && pedido.produtos.length > 0 && (
              <div className="form-section">
                <h3 className="form-section__title">Produtos ({pedido.produtos.length})</h3>
                <div className="pedido-detalhes-produtos">
                  {pedido.produtos.map((p, idx) => (
                    <div key={p.id ?? idx} className="pedido-detalhes-produto-item" style={{ animationDelay: `${idx * 40}ms` }}>
                      <div className="pedido-detalhes-produto-info">
                        <span className="pedido-detalhes-produto-nome">
                          {p.nome}
                          {p.variacaoValor && (
                            <small className="pedido-detalhes-variacao"> · {p.variacaoTipo === 'cor' ? 'Cor' : 'Tam'}: {p.variacaoValor}</small>
                          )}
                        </span>
                        <span className="pedido-detalhes-produto-qtd">x{p.quantidade}</span>
                      </div>
                      <div className="pedido-detalhes-produto-valores">
                        <span>{formatBRL(p.preco)}</span>
                        {p.descontoValor && (
                          <span className="pedido-detalhes-desconto">
                            <Tag size={12} /> -{formatDescontoLabel(p.descontoTipo, p.descontoValor)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pedido.prazos && pedido.prazos.length > 0 && (
              <div className="form-section">
                <h3 className="form-section__title">Prazos de Pagamento</h3>
                <div className="pedido-detalhes-prazos">
                  {pedido.prazos.map((prazo, idx) => (
                    <span key={prazo.id ?? idx} className="pedido-detalhes-prazo-item">{prazo.dias} dias</span>
                  ))}
                </div>
              </div>
            )}

            <div className="form-section">
              <h3 className="form-section__title">Resumo Financeiro</h3>
              <div className="pedido-detalhes-resumo">
                {pedido.descontoValor && (
                  <div className="pedido-detalhes-resumo-linha">
                    <span>Desconto Geral:</span>
                    <span className="pedido-detalhes-desconto">-{formatDescontoLabel(pedido.descontoTipo, pedido.descontoValor)}</span>
                  </div>
                )}
                <div className="pedido-detalhes-resumo-linha pedido-detalhes-resumo-total">
                  <span>Total:</span>
                  <span>{formatBRL(pedido.total)}</span>
                </div>
              </div>
            </div>

            {pedido.observacoes && (
              <div className="form-section">
                <h3 className="form-section__title">Observacoes</h3>
                <p className="pedido-detalhes-observacoes">{pedido.observacoes}</p>
              </div>
            )}

            {error && <div className="order-alert" role="alert"><AlertCircle size={16} /> {error}</div>}
          </div>

          <div className="modal-footer pedido-detalhes-footer">
            <div className="modal-footer__left">
              <CustomButton variant="danger" icon={<Trash2 size={14} />} onClick={handleDelete}>
                Excluir
              </CustomButton>
            </div>
            <div className="modal-footer__actions">
              <CustomButton variant="outline" icon={<FileDown size={14} />} onClick={() => handleExportPDF(false)} disabled={!!exporting}>
                {exporting === 'sem' ? 'Gerando...' : 'PDF sem descontos'}
              </CustomButton>
              <CustomButton variant="primary" icon={<FileDown size={14} />} onClick={() => handleExportPDF(true)} disabled={!!exporting}>
                {exporting === 'com' ? 'Gerando...' : 'PDF com descontos'}
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
