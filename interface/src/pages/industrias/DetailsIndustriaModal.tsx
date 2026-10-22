import { X, Building, Phone, Mail, Edit2, Trash2 } from 'lucide-react';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { type Industria } from '../../api/client';

interface DetailsIndustriaModalProps {
  open: boolean;
  industria: Industria | null;
  onClose: () => void;
  onEdit: (industria: Industria) => void;
  onDelete: (industria: Industria) => void;
}

export function DetailsIndustriaModal({ open, industria, onClose, onEdit, onDelete }: DetailsIndustriaModalProps) {
  if (!open || !industria) return null;

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header__left">
              <Building size={20} />
              <h2 className="modal-title">Detalhes da Industria</h2>
            </div>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="modal-body">
            <div className="details-card">
              <Building size={40} className="details-card__icon" />
              <h3 className="details-card__name">{industria.nome}</h3>
              <span className="details-card__cnpj">{industria.cnpj}</span>
            </div>

            <div className="details-list">
              {industria.telefoneComercial && (
                <div className="details-item">
                  <Phone size={18} className="details-item__icon details-item__icon--green" />
                  <div className="details-item__info">
                    <span className="details-item__label">Telefone Comercial</span>
                    <span className="details-item__value">{industria.telefoneComercial}</span>
                  </div>
                </div>
              )}

              {industria.telefoneAssistencia && (
                <div className="details-item">
                  <Phone size={18} className="details-item__icon details-item__icon--orange" />
                  <div className="details-item__info">
                    <span className="details-item__label">Telefone Assistencia</span>
                    <span className="details-item__value">{industria.telefoneAssistencia}</span>
                  </div>
                </div>
              )}

              {industria.email && (
                <div className="details-item">
                  <Mail size={18} className="details-item__icon details-item__icon--purple" />
                  <div className="details-item__info">
                    <span className="details-item__label">Email</span>
                    <span className="details-item__value">{industria.email}</span>
                  </div>
                </div>
              )}
            </div>

            <p className="details-date">
              Cadastrado em: {industria.dataCadastro}
              {industria.dataEdicao && ` (Editado em: ${industria.dataEdicao})`}
            </p>
          </div>

          <div className="modal-footer">
            <div className="modal-footer__left">
              <CustomButton variant="danger" icon={<Trash2 size={14} />} onClick={() => onDelete(industria)}>
                Excluir
              </CustomButton>
            </div>
            <div className="modal-footer__actions">
              <CustomButton variant="ghost" onClick={onClose}>Fechar</CustomButton>
              <CustomButton variant="primary" icon={<Edit2 size={14} />} onClick={() => onEdit(industria)}>
                Editar
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
