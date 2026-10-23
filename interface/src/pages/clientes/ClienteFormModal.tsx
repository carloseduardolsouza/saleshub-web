import { useState, useEffect } from 'react';
import { X, UserPlus, Edit2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { CustomInput } from '../../components/custom-input';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { api, type Cliente } from '../../api/client';
import { maskCpfCnpj, maskPhone, maskCep, isEmail } from '../masks';
import '../pages-common.css';
import './NewClienteModal.css';

interface Contato {
  id: number;
  nome: string;
  telefone: string;
  email: string;
}

let nextContatoId = 1;

function parseContatos(raw?: string): Contato[] {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((c) => ({ nome: '', telefone: '', email: '', ...c, id: nextContatoId++ })) : [];
  } catch {
    return [];
  }
}

interface Props {
  cliente?: Cliente | null;
  onClose: () => void;
}

// Montado só enquanto aberto (ver wrappers New/Edit), então o estado inicial vem sempre do cliente.
export function ClienteFormModal({ cliente, onClose }: Props) {
  const isEdit = !!cliente?.id;
  const [form, setForm] = useState({
    nomeFantasia: cliente?.nomeFantasia ?? '',
    razaoSocial: cliente?.razaoSocial ?? '',
    cpfCnpj: cliente?.cnpj ?? '',
    inscricaoEstadual: cliente?.inscricaoEstadual ?? '',
    dataNascimento: cliente?.dataNascimento ? cliente.dataNascimento.split('T')[0] : '',
    telefoneEmpresa: cliente?.telefoneEmpresa ?? '',
    emailEmpresa: cliente?.emailEmpresa ?? '',
    endereco: cliente?.enderecoLogradouro ?? '',
    numero: cliente?.enderecoNumero ?? '',
    complemento: cliente?.enderecoComplemento ?? '',
    bairro: cliente?.enderecoBairro ?? '',
    cidade: cliente?.enderecoCidade ?? '',
    estado: cliente?.enderecoEstado ?? '',
    cep: cliente?.enderecoCep ?? '',
    observacoes: cliente?.observacoes ?? '',
  });
  const [contatos, setContatos] = useState<Contato[]>(() => parseContatos(cliente?.contatos));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const updateField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateContato = (id: number, field: 'nome' | 'telefone' | 'email', value: string) =>
    setContatos((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  async function handleSave() {
    setError('');
    if (!form.nomeFantasia.trim()) return setError('Nome Fantasia e obrigatorio.');
    if (form.emailEmpresa && !isEmail(form.emailEmpresa)) return setError('Email da empresa invalido.');
    if (contatos.some((c) => c.email && !isEmail(c.email))) return setError('Existe um contato com email invalido.');

    const contatosValidos = contatos.filter((c) => c.nome || c.telefone || c.email);
    // espalha o cliente original: a API zera os campos ausentes (email, telefone, comprador...)
    const payload: Cliente = {
      ...(cliente ?? {}),
      nomeFantasia: form.nomeFantasia.trim(),
      razaoSocial: form.razaoSocial.trim() || undefined,
      cnpj: form.cpfCnpj || undefined,
      inscricaoEstadual: form.inscricaoEstadual.trim() || undefined,
      dataNascimento: form.dataNascimento || undefined,
      telefoneEmpresa: form.telefoneEmpresa || undefined,
      emailEmpresa: form.emailEmpresa.trim() || undefined,
      enderecoLogradouro: form.endereco.trim() || undefined,
      enderecoNumero: form.numero.trim() || undefined,
      enderecoComplemento: form.complemento.trim() || undefined,
      enderecoBairro: form.bairro.trim() || undefined,
      enderecoCidade: form.cidade.trim() || undefined,
      enderecoEstado: form.estado.trim().toUpperCase() || undefined,
      enderecoCep: form.cep || undefined,
      observacoes: form.observacoes.trim() || undefined,
      contatos: contatosValidos.length > 0 ? JSON.stringify(contatosValidos) : undefined,
    };

    setSaving(true);
    try {
      if (isEdit) await api.clientes.update(cliente!.id!, payload);
      else await api.clientes.create(payload);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar cliente');
      setSaving(false);
    }
  }

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container modal-container--lg" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header__left">
              {isEdit ? <Edit2 size={20} /> : <UserPlus size={20} />}
              <h2 className="modal-title">{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h2>
            </div>
            <button className="modal-close" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
          </div>

          <div className="modal-body">
            <div className="form-section">
              <h3 className="form-section__title">Dados Principais</h3>
              <div className="form-grid form-grid--2">
                <CustomInput label="Nome Fantasia *" value={form.nomeFantasia} onChange={(e) => updateField('nomeFantasia', e.target.value)} placeholder="Nome do cliente" autoFocus />
                <CustomInput label="Razao Social" value={form.razaoSocial} onChange={(e) => updateField('razaoSocial', e.target.value)} placeholder="Razao social" />
              </div>
              <div className="form-grid form-grid--2">
                <CustomInput label="CPF/CNPJ" value={form.cpfCnpj} onChange={(e) => updateField('cpfCnpj', maskCpfCnpj(e.target.value))} placeholder="00.000.000/0000-00" inputMode="numeric" />
                <CustomInput label="Inscricao Estadual" value={form.inscricaoEstadual} onChange={(e) => updateField('inscricaoEstadual', e.target.value)} placeholder="IE" />
              </div>
              <div className="form-grid form-grid--2">
                <CustomInput label="Data de Nascimento" type="date" value={form.dataNascimento} onChange={(e) => updateField('dataNascimento', e.target.value)} />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Dados da Empresa</h3>
              <div className="form-grid form-grid--2">
                <CustomInput label="Telefone Empresa" value={form.telefoneEmpresa} onChange={(e) => updateField('telefoneEmpresa', maskPhone(e.target.value))} placeholder="(11) 3333-4444" inputMode="tel" />
                <CustomInput label="Email Empresa" type="email" value={form.emailEmpresa} onChange={(e) => updateField('emailEmpresa', e.target.value)} placeholder="contato@empresa.com" />
              </div>
            </div>

            <div className="form-section">
              <div className="form-section__header">
                <h3 className="form-section__title">Contatos</h3>
                <CustomButton type="button" variant="ghost" icon={<Plus size={14} />} onClick={() => setContatos((prev) => [...prev, { id: nextContatoId++, nome: '', telefone: '', email: '' }])}>
                  Adicionar
                </CustomButton>
              </div>

              {contatos.length === 0 && (
                <p className="contatos__empty">Nenhum contato adicionado. Clique em &quot;Adicionar&quot; para comecar.</p>
              )}

              {contatos.map((contato) => (
                <div key={contato.id} className="contato-card item-enter">
                  <div className="contato-card__header">
                    <span className="contato-card__label">Contato</span>
                    <button type="button" className="icon-btn icon-btn--xs icon-btn--danger" title="Remover" aria-label="Remover contato" onClick={() => setContatos((prev) => prev.filter((c) => c.id !== contato.id))}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="form-grid form-grid--3">
                    <CustomInput label="Nome" value={contato.nome} onChange={(e) => updateContato(contato.id, 'nome', e.target.value)} placeholder="Nome do contato" />
                    <CustomInput label="Telefone" value={contato.telefone} onChange={(e) => updateContato(contato.id, 'telefone', maskPhone(e.target.value))} placeholder="(11) 99999-9999" inputMode="tel" />
                    <CustomInput label="Email" type="email" value={contato.email} onChange={(e) => updateContato(contato.id, 'email', e.target.value)} placeholder="email@contato.com" />
                  </div>
                </div>
              ))}
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Endereco</h3>
              <CustomInput label="Logradouro" value={form.endereco} onChange={(e) => updateField('endereco', e.target.value)} placeholder="Rua, avenida..." />
              <div className="form-grid form-grid--3">
                <CustomInput label="Numero" value={form.numero} onChange={(e) => updateField('numero', e.target.value)} placeholder="123" />
                <CustomInput label="Complemento" value={form.complemento} onChange={(e) => updateField('complemento', e.target.value)} placeholder="Sala, bloco..." />
                <CustomInput label="Bairro" value={form.bairro} onChange={(e) => updateField('bairro', e.target.value)} placeholder="Bairro" />
              </div>
              <div className="form-grid form-grid--3">
                <CustomInput label="Cidade" value={form.cidade} onChange={(e) => updateField('cidade', e.target.value)} placeholder="Cidade" />
                <CustomInput label="Estado" value={form.estado} onChange={(e) => updateField('estado', e.target.value.slice(0, 2))} placeholder="UF" maxLength={2} />
                <CustomInput label="CEP" value={form.cep} onChange={(e) => updateField('cep', maskCep(e.target.value))} placeholder="00000-000" inputMode="numeric" />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Observacoes</h3>
              <textarea className="form-textarea" value={form.observacoes} onChange={(e) => updateField('observacoes', e.target.value)} placeholder="Observacoes sobre o cliente..." rows={3} />
            </div>
          </div>

          <div className="modal-footer">
            {error ? <span className="order-error" role="alert"><AlertCircle size={14} /> {error}</span> : <span />}
            <div className="modal-footer__actions">
              <CustomButton variant="ghost" onClick={onClose} disabled={saving}>Cancelar</CustomButton>
              <CustomButton variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : isEdit ? 'Salvar Alteracoes' : 'Salvar Cliente'}
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
