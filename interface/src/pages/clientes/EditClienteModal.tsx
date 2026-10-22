import { useState, useEffect } from 'react';
import { X, UserPlus, Plus, Trash2 } from 'lucide-react';
import { CustomInput } from '../../components/custom-input';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import { api, type Cliente } from '../../api/client';
import './NewClienteModal.css';

interface Contato {
  id: number;
  nome: string;
  telefone: string;
  email: string;
}

interface EditClienteModalProps {
  open: boolean;
  cliente: Cliente | null;
  onClose: () => void;
}

let nextContatoId = 1;

export function EditClienteModal({ open, cliente, onClose }: EditClienteModalProps) {
  const [form, setForm] = useState({
    nomeFantasia: '',
    razaoSocial: '',
    cpfCnpj: '',
    inscricaoEstadual: '',
    dataNascimento: '',
    telefoneEmpresa: '',
    emailEmpresa: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: '',
  });

  const [contatos, setContatos] = useState<Contato[]>([]);

  useEffect(() => {
    if (open && cliente) {
      setForm({
        nomeFantasia: cliente.nomeFantasia,
        razaoSocial: cliente.razaoSocial || '',
        cpfCnpj: cliente.cnpj || '',
        inscricaoEstadual: cliente.inscricaoEstadual || '',
        dataNascimento: cliente.dataNascimento ? cliente.dataNascimento.split('T')[0] : '',
        telefoneEmpresa: cliente.telefoneEmpresa || '',
        emailEmpresa: cliente.emailEmpresa || '',
        endereco: cliente.enderecoLogradouro || '',
        cidade: cliente.enderecoCidade || '',
        estado: cliente.enderecoEstado || '',
        cep: cliente.enderecoCep || '',
        observacoes: cliente.observacoes || '',
      });
      try {
        const parsed = cliente.contatos ? JSON.parse(cliente.contatos) : [];
        setContatos(parsed.map((c: any) => ({ id: nextContatoId++, ...c })));
      } catch {
        setContatos([]);
      }
    }
  }, [open, cliente]);

  if (!open || !cliente) return null;

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addContato() {
    setContatos((prev) => [...prev, { id: nextContatoId++, nome: '', telefone: '', email: '' }]);
  }

  function removeContato(id: number) {
    setContatos((prev) => prev.filter((c) => c.id !== id));
  }

  function updateContato(id: number, field: 'nome' | 'telefone' | 'email', value: string) {
    setContatos((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  async function handleSave() {
    if (!cliente) return;
    if (!form.nomeFantasia.trim()) {
      alert('Nome Fantasia e obrigatorio!');
      return;
    }

    try {
      await api.clientes.update(cliente.id!, {
        nomeFantasia: form.nomeFantasia,
        razaoSocial: form.razaoSocial || undefined,
        cnpj: form.cpfCnpj || undefined,
        inscricaoEstadual: form.inscricaoEstadual || undefined,
        dataNascimento: form.dataNascimento || undefined,
        telefoneEmpresa: form.telefoneEmpresa || undefined,
        emailEmpresa: form.emailEmpresa || undefined,
        enderecoLogradouro: form.endereco || undefined,
        enderecoCidade: form.cidade || undefined,
        enderecoEstado: form.estado || undefined,
        enderecoCep: form.cep || undefined,
        observacoes: form.observacoes || undefined,
        contatos: contatos.length > 0 ? JSON.stringify(contatos) : undefined,
      });
      onClose();
    } catch {
      alert('Erro ao atualizar cliente');
    }
  }

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container modal-container--lg" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header__left">
              <UserPlus size={20} />
              <h2 className="modal-title">Editar Cliente</h2>
            </div>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="modal-body">
            <div className="form-section">
              <h3 className="form-section__title">Dados Principais</h3>
              <div className="form-grid form-grid--2">
                <CustomInput
                  label="Nome Fantasia *"
                  value={form.nomeFantasia}
                  onChange={(e) => updateField('nomeFantasia', e.target.value)}
                  placeholder="Nome do cliente"
                />
                <CustomInput
                  label="Razao Social"
                  value={form.razaoSocial}
                  onChange={(e) => updateField('razaoSocial', e.target.value)}
                  placeholder="Razao social"
                />
              </div>
              <div className="form-grid form-grid--2">
                <CustomInput
                  label="CPF/CNPJ"
                  value={form.cpfCnpj}
                  onChange={(e) => updateField('cpfCnpj', e.target.value)}
                  placeholder="000.000.000-00"
                />
                <CustomInput
                  label="Inscricao Estadual"
                  value={form.inscricaoEstadual}
                  onChange={(e) => updateField('inscricaoEstadual', e.target.value)}
                  placeholder="IE"
                />
              </div>
              <div className="form-grid form-grid--2">
                <CustomInput
                  label="Data de Nascimento"
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) => updateField('dataNascimento', e.target.value)}
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Dados da Empresa</h3>
              <div className="form-grid form-grid--2">
                <CustomInput
                  label="Telefone Empresa"
                  value={form.telefoneEmpresa}
                  onChange={(e) => updateField('telefoneEmpresa', e.target.value)}
                  placeholder="(11) 3333-4444"
                />
                <CustomInput
                  label="Email Empresa"
                  type="email"
                  value={form.emailEmpresa}
                  onChange={(e) => updateField('emailEmpresa', e.target.value)}
                  placeholder="contato@empresa.com"
                />
              </div>
            </div>

            <div className="form-section">
              <div className="form-section__header">
                <h3 className="form-section__title">Contatos</h3>
                <CustomButton variant="ghost" icon={<Plus size={14} />} onClick={addContato}>
                  Adicionar
                </CustomButton>
              </div>

              {contatos.length === 0 && (
                <p className="contatos__empty">Nenhum contato adicionado. Clique em "Adicionar" para comecar.</p>
              )}

              {contatos.map((contato) => (
                <div key={contato.id} className="contato-card">
                  <div className="contato-card__header">
                    <span className="contato-card__label">Contato</span>
                    <button className="icon-btn icon-btn--xs icon-btn--danger" title="Remover" onClick={() => removeContato(contato.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="form-grid form-grid--3">
                    <CustomInput
                      label="Nome"
                      value={contato.nome}
                      onChange={(e) => updateContato(contato.id, 'nome', e.target.value)}
                      placeholder="Nome do contato"
                    />
                    <CustomInput
                      label="Telefone"
                      value={contato.telefone}
                      onChange={(e) => updateContato(contato.id, 'telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                    <CustomInput
                      label="Email"
                      type="email"
                      value={contato.email}
                      onChange={(e) => updateContato(contato.id, 'email', e.target.value)}
                      placeholder="email@contato.com"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Endereco</h3>
              <CustomInput
                label="Endereco"
                value={form.endereco}
                onChange={(e) => updateField('endereco', e.target.value)}
                placeholder="Rua, numero, complemento"
              />
              <div className="form-grid form-grid--3">
                <CustomInput
                  label="Cidade"
                  value={form.cidade}
                  onChange={(e) => updateField('cidade', e.target.value)}
                  placeholder="Cidade"
                />
                <CustomInput
                  label="Estado"
                  value={form.estado}
                  onChange={(e) => updateField('estado', e.target.value)}
                  placeholder="UF"
                />
                <CustomInput
                  label="CEP"
                  value={form.cep}
                  onChange={(e) => updateField('cep', e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Observacoes</h3>
              <textarea
                className="form-textarea"
                value={form.observacoes}
                onChange={(e) => updateField('observacoes', e.target.value)}
                placeholder="Observacoes sobre o cliente..."
                rows={3}
              />
            </div>
          </div>

          <div className="modal-footer">
            <CustomButton variant="ghost" onClick={onClose}>Cancelar</CustomButton>
            <CustomButton variant="primary" onClick={handleSave}>Salvar Alteracoes</CustomButton>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
