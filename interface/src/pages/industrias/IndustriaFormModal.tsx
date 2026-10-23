import { useState, useEffect } from 'react';
import { X, Building, Edit2, AlertCircle } from 'lucide-react';
import { CustomInput } from '../../components/custom-input';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { api, type Industria } from '../../api/client';
import { maskCnpj, maskPhone, isEmail } from '../masks';
import '../pages-common.css';

interface Props {
  industria?: Industria | null;
  onClose: () => void;
}

// Montado só enquanto aberto (ver wrappers New/Edit), então o estado inicial vem sempre da indústria.
export function IndustriaFormModal({ industria, onClose }: Props) {
  const isEdit = !!industria?.id;
  const [form, setForm] = useState({
    cnpj: industria?.cnpj ?? '',
    nome: industria?.nome ?? '',
    telefoneComercial: industria?.telefoneComercial ?? '',
    telefoneAssistencia: industria?.telefoneAssistencia ?? '',
    email: industria?.email ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const updateField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSave() {
    setError('');
    if (form.cnpj.replace(/\D/g, '').length !== 14) return setError('CNPJ deve ter 14 digitos.');
    if (!form.nome.trim()) return setError('Nome da industria e obrigatorio.');
    if (form.email && !isEmail(form.email)) return setError('Email invalido.');

    const payload: Industria = { ...form, nome: form.nome.trim(), email: form.email.trim() };
    setSaving(true);
    try {
      if (isEdit) await api.industrias.update(industria!.id!, payload);
      else await api.industrias.create(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar industria');
      setSaving(false);
    }
  }

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header__left">
              {isEdit ? <Edit2 size={20} /> : <Building size={20} />}
              <h2 className="modal-title">{isEdit ? 'Editar Industria' : 'Cadastrar Nova Industria'}</h2>
            </div>
            <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
          </div>

          <div className="modal-body">
            <CustomInput label="CNPJ *" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={(e) => updateField('cnpj', maskCnpj(e.target.value))} inputMode="numeric" autoFocus />
            <CustomInput label="Nome da Industria *" placeholder="Ex: Samsung Electronics, Apple Inc..." value={form.nome} onChange={(e) => updateField('nome', e.target.value)} />
            <div className="form-grid form-grid--2">
              <CustomInput label="Telefone Comercial" placeholder="(11) 99999-9999" value={form.telefoneComercial} onChange={(e) => updateField('telefoneComercial', maskPhone(e.target.value))} inputMode="tel" />
              <CustomInput label="Telefone Assistencia" placeholder="(11) 88888-8888" value={form.telefoneAssistencia} onChange={(e) => updateField('telefoneAssistencia', maskPhone(e.target.value))} inputMode="tel" />
            </div>
            <CustomInput label="Email" placeholder="contato@industria.com" value={form.email} onChange={(e) => updateField('email', e.target.value)} type="email" />
            <p className="form-required-note">* Campos obrigatorios</p>
          </div>

          <div className="modal-footer">
            {error ? <span className="order-error" role="alert"><AlertCircle size={14} /> {error}</span> : <span />}
            <div className="modal-footer__actions">
              <CustomButton variant="ghost" onClick={onClose} disabled={saving}>Cancelar</CustomButton>
              <CustomButton variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</CustomButton>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
