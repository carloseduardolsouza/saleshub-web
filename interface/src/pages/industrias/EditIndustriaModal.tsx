import { useState, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';
import { CustomInput } from '../../components/custom-input';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { api, type Industria } from '../../api/client';

interface EditIndustriaModalProps {
  open: boolean;
  industria: Industria | null;
  onClose: () => void;
}

export function EditIndustriaModal({ open, industria, onClose }: EditIndustriaModalProps) {
  const [form, setForm] = useState({
    cnpj: '',
    nome: '',
    telefoneComercial: '',
    telefoneAssistencia: '',
    email: '',
  });

  useEffect(() => {
    if (open && industria) {
      setForm({
        cnpj: industria.cnpj,
        nome: industria.nome,
        telefoneComercial: industria.telefoneComercial || '',
        telefoneAssistencia: industria.telefoneAssistencia || '',
        email: industria.email || '',
      });
    }
  }, [open, industria]);

  if (!open || !industria) return null;

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.cnpj.trim()) {
      alert('CNPJ e obrigatorio!');
      return;
    }
    if (!form.nome.trim()) {
      alert('Nome da industria e obrigatorio!');
      return;
    }
    const cnpjNumbers = form.cnpj.replace(/\D/g, '');
    if (cnpjNumbers.length !== 14) {
      alert('CNPJ deve ter 14 digitos!');
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert('Email invalido!');
      return;
    }

    try {
      if (!industria) return;
      await api.industrias.update(industria.id!, form);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar industria');
    }
  }

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header__left">
              <Edit2 size={20} />
              <h2 className="modal-title">Editar Industria</h2>
            </div>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">CNPJ *</label>
              <CustomInput
                placeholder="00.000.000/0000-00"
                value={form.cnpj}
                onChange={(e) => updateField('cnpj', e.target.value)}
                maxLength={18}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nome da Industria *</label>
              <CustomInput
                placeholder="Ex: Samsung Electronics, Apple Inc..."
                value={form.nome}
                onChange={(e) => updateField('nome', e.target.value)}
              />
            </div>

            <div className="form-grid form-grid--2">
              <div className="form-group">
                <label className="form-label">Telefone Comercial</label>
                <CustomInput
                  placeholder="(11) 99999-9999"
                  value={form.telefoneComercial}
                  onChange={(e) => updateField('telefoneComercial', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Telefone Assistencia</label>
                <CustomInput
                  placeholder="(11) 88888-8888"
                  value={form.telefoneAssistencia}
                  onChange={(e) => updateField('telefoneAssistencia', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <CustomInput
                placeholder="contato@industria.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                type="email"
              />
            </div>

            <p className="form-required-note">* Campos obrigatorios</p>
          </div>

          <div className="modal-footer">
            <CustomButton variant="ghost" onClick={onClose}>Cancelar</CustomButton>
            <CustomButton variant="primary" onClick={handleSave}>Salvar</CustomButton>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
