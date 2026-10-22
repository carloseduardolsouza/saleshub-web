import { useState } from 'react';
import { X, Eye, Trash2, Tag, FileDown } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { api, type Pedido } from '../../api/client';

interface DetailsPedidoModalProps {
  open: boolean;
  pedido: Pedido | null;
  onClose: () => void;
  onDelete: (id: number) => void;
}

export function DetailsPedidoModal({ open, pedido, onClose, onDelete }: DetailsPedidoModalProps) {
  const [exporting, setExporting] = useState(false);

  if (!open || !pedido) return null;

  function formatPrice(value: number) {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }

  function formatDate(date?: string) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }

  async function handleExportPDF(mostrarDescontos: boolean) {
    if (!pedido?.id) return;
    setExporting(true);
    try {
      await api.pedidos.downloadPDF(pedido.id, mostrarDescontos);
    } catch {
      alert('Erro ao gerar PDF');
    } finally {
      setExporting(false);
    }
  }

  function promptExportPDF() {
    const opcao = window.confirm('Deseja gerar o PDF com descontos visiveis?\n\nOK = Com Descontos\nCancelar = Sem Descontos');
    handleExportPDF(opcao);
  }

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container modal-container--lg" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header__left">
              <Eye size={20} />
              <h2 className="modal-title">Detalhes do Pedido #{pedido.id}</h2>
            </div>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
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
                  <span className="details-item__value">{pedido.metodoPagamento}</span>
                </div>
              </div>
            </div>

            {pedido.produtos && pedido.produtos.length > 0 && (
              <div className="form-section">
                <h3 className="form-section__title">Produtos ({pedido.produtos.length})</h3>
                <div className="pedido-detalhes-produtos">
                  {pedido.produtos.map((p, idx) => (
                    <div key={idx} className="pedido-detalhes-produto-item">
                      <div className="pedido-detalhes-produto-info">
                        <span className="pedido-detalhes-produto-nome">{p.nome}</span>
                        <span className="pedido-detalhes-produto-qtd">x{p.quantidade}</span>
                      </div>
                      <div className="pedido-detalhes-produto-valores">
                        <span>{formatPrice(p.preco)}</span>
                        {p.descontoValor && (
                          <span className="pedido-detalhes-desconto">
                            <Tag size={12} /> -{p.descontoTipo === 'percentual' ? `${p.descontoValor}%` : formatPrice(parseFloat(p.descontoValor))}
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
                    <span key={idx} className="pedido-detalhes-prazo-item">{prazo.dias} dias</span>
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
                    <span className="pedido-detalhes-desconto">
                      -{pedido.descontoTipo === 'percentual' ? `${pedido.descontoValor}%` : formatPrice(parseFloat(pedido.descontoValor))}
                    </span>
                  </div>
                )}
                <div className="pedido-detalhes-resumo-linha pedido-detalhes-resumo-total">
                  <span>Total:</span>
                  <span>{formatPrice(pedido.total)}</span>
                </div>
              </div>
            </div>

            {pedido.observacoes && (
              <div className="form-section">
                <h3 className="form-section__title">Observacoes</h3>
                <p className="pedido-detalhes-observacoes">{pedido.observacoes}</p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <div className="modal-footer__left">
              <CustomButton variant="danger" icon={<Trash2 size={14} />} onClick={() => { onDelete(pedido.id!); onClose(); }}>
                Excluir
              </CustomButton>
            </div>
            <div className="modal-footer__actions">
              <CustomButton variant="outline" icon={<FileDown size={14} />} onClick={promptExportPDF} disabled={exporting}>
                {exporting ? 'Gerando...' : 'Exportar PDF'}
              </CustomButton>
              <CustomButton variant="ghost" onClick={onClose}>Fechar</CustomButton>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
