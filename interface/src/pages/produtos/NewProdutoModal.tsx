import { useState } from 'react';
import { X, Package, Plus, Trash2 } from 'lucide-react';
import { CustomInput } from '../../components/custom-input';
import { CustomSelect } from '../../components/custom-select';
import { CustomButton } from '../../components/custom-button';
import { ModalPortal } from '../../components/modal-portal';
import './NewProdutoModal.css';

interface Variacao {
  nome: string;
  preco: number;
}

interface NewProdutoModalProps {
  open: boolean;
  onClose: () => void;
}

const INDUSTRIAS_OPTIONS = [
  { value: 'Dell', label: 'Dell' },
  { value: 'Apple', label: 'Apple' },
  { value: 'Samsung', label: 'Samsung' },
  { value: 'Logitech', label: 'Logitech' },
  { value: 'Keychron', label: 'Keychron' },
  { value: 'LG', label: 'LG' },
];

export function NewProdutoModal({ open, onClose }: NewProdutoModalProps) {
  const [form, setForm] = useState({
    nome: '',
    preco: '',
    industria: '',
    descricao: '',
  });
  const [variacoes, setVariacoes] = useState<Variacao[]>([]);
  const [novaVariacao, setNovaVariacao] = useState('');

  if (!open) return null;

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addVariacao() {
    if (!novaVariacao.trim()) return;
    setVariacoes((prev) => [...prev, { nome: novaVariacao.trim(), preco: 0 }]);
    setNovaVariacao('');
  }

  function removeVariacao(index: number) {
    setVariacoes((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariacao(index: number, field: keyof Variacao, value: string | number) {
    setVariacoes((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  }

  function handleSave() {
    if (!form.nome.trim() || !form.preco || !form.industria) {
      alert('Nome, Preco e Industria sao obrigatorios!');
      return;
    }
    alert(`Produto cadastrado!\nNome: ${form.nome}\nPreco: R$ ${form.preco}`);
    onClose();
  }

  return (
    <ModalPortal>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container modal-container--lg" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header__left">
              <Package size={20} />
              <h2 className="modal-title">Novo Produto</h2>
            </div>
            <button className="modal-close" onClick={onClose}><X size={18} /></button>
          </div>

          <div className="modal-body">
            <div className="form-section">
              <h3 className="form-section__title">Dados do Produto</h3>
              <CustomInput
                label="Nome do Produto *"
                value={form.nome}
                onChange={(e) => updateField('nome', e.target.value)}
                placeholder="Nome do produto"
              />
              <div className="form-grid form-grid--2">
                <CustomInput
                  label="Preco *"
                  type="number"
                  value={form.preco}
                  onChange={(e) => updateField('preco', e.target.value)}
                  placeholder="0,00"
                />
                <CustomSelect
                  label="Industria *"
                  options={INDUSTRIAS_OPTIONS}
                  value={form.industria}
                  onChange={(e) => updateField('industria', e.target.value)}
                  placeholder="Selecione"
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Descricao</h3>
              <textarea
                className="form-textarea"
                value={form.descricao}
                onChange={(e) => updateField('descricao', e.target.value)}
                placeholder="Descricao do produto (opcional)..."
                rows={3}
              />
            </div>

            <div className="form-section">
              <h3 className="form-section__title">Variacoes</h3>
              <div className="variacao-input">
                <CustomInput
                  value={novaVariacao}
                  onChange={(e) => setNovaVariacao(e.target.value)}
                  placeholder="Ex: Cor: Vermelho, Tamanho: M"
                />
                <CustomButton variant="outline" size="sm" icon={<Plus size={14} />} onClick={addVariacao}>
                  Add
                </CustomButton>
              </div>

              {variacoes.length > 0 && (
                <div className="variacao-list">
                  {variacoes.map((v, idx) => (
                    <div key={idx} className="variacao-item">
                      <span className="variacao-item__name">{v.nome}</span>
                      <div className="variacao-item__fields">
                        <CustomInput
                          type="number"
                          value={String(v.preco)}
                          onChange={(e) => updateVariacao(idx, 'preco', Number(e.target.value))}
                          placeholder="Preco"
                        />
                        <button className="variacao-item__remove" onClick={() => removeVariacao(idx)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <CustomButton variant="outline" onClick={onClose}>Cancelar</CustomButton>
            <CustomButton variant="primary" onClick={handleSave}>Salvar Produto</CustomButton>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
